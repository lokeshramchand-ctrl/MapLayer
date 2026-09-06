from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from mcp.server.fastmcp import FastMCP
import asyncio
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
import ollama
import json
import uvicorn
from pymilvus import MilvusClient

app = FastAPI(title="ZoningLens")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
mcp = FastMCP("SanDiegoSpatialAgent")

# --- MongoDB Connection ---
uri = "mongodb://lokesh:Lokesh%401234@10.10.10.110:27017/?authSource=admin"
client = AsyncIOMotorClient(uri)
db = client.geodata

# --- Pydantic Data Models ---
class AddressRequest(BaseModel):
    address: str

class PointRequest(BaseModel):
    longitude: float
    latitude: float

class PolygonRequest(BaseModel):
    geometry: dict

class ChatRequest(BaseModel):
    prompt: str

class HandbookSearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = None

class CodeEntry(BaseModel):
    code: str
    title: str

    def to_text(self) -> str:
        return f"Code abbreviation: {self.code}. Title: {self.title}"

class RetrievedCode(BaseModel):
    entry: CodeEntry
    score: float

class RAGResponse(BaseModel):
    question: str
    answer: str
    sources: List[RetrievedCode]

class CodeSearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5

# Setup Ollama Client
ollama_client = ollama.AsyncClient(host='http://10.10.10.100:11434')

MODEL_NAME = "llama3.1"
EMBEDDING_MODEL = "nomic-embed-text-v2-moe:latest"

# ==========================================
# MILVUS & CONFIGURATIONS
# ==========================================
MILVUS_URI = "http://10.10.10.130:19530"

# PDF Handbook
HANDBOOK_COLLECTION_NAME = "Zoning_Lens"
HANDBOOK_TOP_K = 5

# CA Codes
CODES_COLLECTION_NAME = "pubinfo_codes"
CODES_LLM_MODEL = "llama3.1"

_milvus_client: Optional[MilvusClient] = None

def get_milvus_client() -> MilvusClient:
    global _milvus_client
    if _milvus_client is None:
        _milvus_client = MilvusClient(uri=MILVUS_URI)
    return _milvus_client

class RetrievedChunk(BaseModel):
    text: str
    page: int
    source: str
    score: float

async def get_embedding(text: str) -> List[float]:
    response = await ollama_client.embeddings(model=EMBEDDING_MODEL, prompt=text)
    return response["embedding"]

# ==========================================
# PDF HANDBOOK RAG METHODS
# ==========================================
async def search_pdf_handbook(query: str, top_k: int = HANDBOOK_TOP_K) -> List[RetrievedChunk]:
    query_vector = await get_embedding(query)
    milvus = get_milvus_client()
    try:
        results = milvus.search(
            collection_name=HANDBOOK_COLLECTION_NAME,
            data=[query_vector],
            limit=top_k,
            output_fields=["text", "page", "source"],
        )[0]
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Milvus search failed for collection '{HANDBOOK_COLLECTION_NAME}': {e}",
        )

    return [
        RetrievedChunk(
            text=hit["entity"]["text"],
            page=hit["entity"]["page"],
            source=hit["entity"]["source"],
            score=hit["distance"],
        )
        for hit in results
    ]

# ==========================================
# CA CODES RAG METHODS
# ==========================================
async def search_ca_codes(query: str, top_k: int = 5) -> List[RetrievedCode]:
    query_vector = await get_embedding(query)
    milvus = get_milvus_client()
    
    try:
        results = milvus.search(
            collection_name=CODES_COLLECTION_NAME,
            data=[query_vector],
            limit=top_k,
            output_fields=["code", "title"],
        )[0]
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Milvus search failed for collection '{CODES_COLLECTION_NAME}': {e}",
        )

    return [
        RetrievedCode(
            entry=CodeEntry(code=hit["entity"]["code"], title=hit["entity"]["title"]),
            score=hit["distance"],
        )
        for hit in results
    ]

# ==========================================
# MCP TOOLS
# ==========================================
@mcp.tool()
async def search_pdf_handbook_tool(query: str, top_k: int = HANDBOOK_TOP_K) -> dict:
    try:
        chunks = await search_pdf_handbook(query, top_k=top_k)
    except HTTPException as e:
        return {"error": e.detail}

    if not chunks:
        return {"error": f"No relevant passages found in the handbook for '{query}'."}

    return {
        "query": query,
        "results": [c.model_dump() for c in chunks],
    }

@mcp.tool()
async def search_ca_codes_tool(query: str, top_k: int = 5) -> dict:
    try:
        codes = await search_ca_codes(query, top_k=top_k)
    except HTTPException as e:
        return {"error": e.detail}

    if not codes:
        return {"error": f"No relevant legislative codes found for '{query}'."}

    return {
        "query": query,
        "results": [c.model_dump() for c in codes]
    }

@mcp.tool()
async def analyze_property_hazards(address: str) -> dict:
    address_str = address.strip()
    
    # String manipulation walk-around to replace regular expressions
    parts = address_str.split(" ", 1)

    if len(parts) == 2 and parts[0].isdigit():
        addr_number = int(parts[0])
        addr_name = parts[1]
        query = {
            "properties.ADDRNMBR": addr_number,
            "properties.ADDRNAME": {"$regex": addr_name.split()[0], "$options": "i"}
        }
    else:
        query = {"properties.ADDRNAME": {"$regex": address_str, "$options": "i"}}

    addr_doc = await db.Address_Points_shapefile.find_one(query, {"geometry": 1, "_id": 0})
    if not addr_doc:
        return {"error": f"Could not find address '{address}' in San Diego database."}

    point_geom = addr_doc["geometry"]
    parcel_query = {"geometry": {"$geoIntersects": {"$geometry": point_geom}}}
    parcel_doc = await db.Parcels_shapefile.find_one(parcel_query, {"geometry": 1, "_id": 0})

    if not parcel_doc:
        return {"error": f"Found coordinates for '{address}', but no parcel boundary exists there."}

    parcel_geom = parcel_doc["geometry"]
    spatial_query = {"geometry": {"$geoIntersects": {"$geometry": parcel_geom}}}
    projection = {"geometry": 0, "_id": 0}

    async def check_layer(collection, layer_name):
        doc = await collection.find_one(spatial_query, projection)
        return layer_name, {"intersects": bool(doc), "details": doc.get("properties") if doc else None}

    results = await asyncio.gather(
        check_layer(db.Fire_Hazard_Severity_Zones_SD_shapefile, "Fire Zone"),
        check_layer(db.Airport_Safety_Zones_shapefile, "Airport Zone"),
        check_layer(db.Coastal_Zones_shapefile, "Coastal Zone")
    )

    return dict(results)

# ==========================================
# ENDPOINTS: REST APIs
# ==========================================
@app.post("/api/handbook/search")
async def handbook_search_endpoint(req: HandbookSearchRequest):
    top_k = req.top_k or HANDBOOK_TOP_K
    chunks = await search_pdf_handbook(req.query, top_k=top_k)
    if not chunks:
        raise HTTPException(status_code=404, detail="No relevant passages found.")
    return {"query": req.query, "results": [c.model_dump() for c in chunks]}

@app.post("/api/codes/search")
async def codes_search_endpoint(req: CodeSearchRequest):
    codes = await search_ca_codes(req.query, top_k=req.top_k or 5)
    if not codes:
        raise HTTPException(status_code=404, detail="No codes found.")
    return {"query": req.query, "results": [c.model_dump() for c in codes]}

@app.post("/api/codes/rag", response_model=RAGResponse)
async def codes_rag_endpoint(req: CodeSearchRequest):
    retrieved = await search_ca_codes(req.query, top_k=req.top_k or 5)
    
    context = "\n".join(f"{r.entry.code}: {r.entry.title}" for r in retrieved)
    system_prompt = (
        "You are an assistant for question-answering tasks about California legislative codes."
        "Use the following pieces of retrieved context to answer the question."
        "If the answer is not in the context, explicitly state that you don't know."
        "Keep your answers concise, accurate, and directly address the prompt.\n\n"
        f"Context:\n{context}"
    )
    
    response = await ollama_client.chat(
        model=CODES_LLM_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": req.query},
        ],
        options={"temperature": 0.1}
    )
    
    return RAGResponse(
        question=req.query,
        answer=response["message"]["content"],
        sources=retrieved
    )

@app.post("/api/geocode")
async def geocode_address(req: AddressRequest):
    address_str = req.address.strip()
    
    # String manipulation walk-around to replace regular expressions
    parts = address_str.split(" ", 1)

    if len(parts) == 2 and parts[0].isdigit():
        addr_number = int(parts[0])
        addr_name = parts[1]
        primary_street = addr_name.split()[0] 
        query = {
            "properties.ADDRNMBR": addr_number,
            "properties.ADDRNAME": {"$regex": primary_street, "$options": "i"}
        }
    else:
        query = {"properties.ADDRNAME": {"$regex": address_str, "$options": "i"}}

    doc = await db.Address_Points_shapefile.find_one(
        query,
        {"geometry": 1, "properties.ADDRNMBR": 1, "properties.ADDRNAME": 1, "properties.ADDRSFX": 1, "_id": 0}
    )

    if not doc:
        raise HTTPException(status_code=404, detail="Address not found in database")

    props = doc.get("properties", {})
    raw_num = props.get('ADDRNMBR', '')
    house_num = int(raw_num) if isinstance(raw_num, float) and raw_num.is_integer() else raw_num
    found_address = f"{house_num} {props.get('ADDRNAME', '')} {props.get('ADDRSFX', '')}".strip()

    return {
        "formatted_address": found_address,
        "coordinates": doc["geometry"]["coordinates"],
        "point_geometry": doc["geometry"]
    }

@app.post("/api/parcel")
async def get_parcel(req: PointRequest):
    query = {
        "geometry": {
            "$geoIntersects": {
                "$geometry": {
                    "type": "Point",
                    "coordinates": [req.longitude, req.latitude]
                }
            }
        }
    }

    parcel = await db.Parcels_shapefile.find_one(
        query,
        {"geometry": 1, "properties.APN": 1, "properties.apn": 1, "_id": 0}
    )

    if not parcel:
        raise HTTPException(status_code=404, detail="No parcel boundary found at these coordinates")

    props = parcel.get("properties", {})
    apn = props.get("APN") or props.get("apn") or "Unknown"

    return {
        "apn": apn,
        "geometry": parcel["geometry"]
    }

@app.post("/api/zones/fire")
async def check_fire_zone(req: PolygonRequest):
    spatial_query = {"geometry": {"$geoIntersects": {"$geometry": req.geometry}}}
    doc = await db.Fire_Hazard_Severity_Zones_SD_shapefile.find_one(spatial_query, {"geometry": 0, "_id": 0})
    return {"layer": "fire_zone", "intersects": bool(doc), "details": doc.get("properties", {}) if doc else None}

@app.post("/api/zones/airport")
async def check_airport_zone(req: PolygonRequest):
    spatial_query = {"geometry": {"$geoIntersects": {"$geometry": req.geometry}}}
    doc = await db.Airport_Safety_Zones_shapefile.find_one(spatial_query, {"geometry": 0, "_id": 0})
    return {"layer": "airport_zone", "intersects": bool(doc), "details": doc.get("properties", {}) if doc else None}

@app.post("/api/zones/coastal")
async def check_coastal_zone(req: PolygonRequest):
    spatial_query = {"geometry": {"$geoIntersects": {"$geometry": req.geometry}}}
    doc = await db.Coastal_Zones_shapefile.find_one(spatial_query, {"geometry": 0, "_id": 0})
    return {"layer": "coastal_zone", "intersects": bool(doc), "details": doc.get("properties", {}) if doc else None}

@app.post("/api/chat")
async def chat_with_spatial_agent(req: ChatRequest):
    user_prompt = req.prompt

    tools = [
        {
            'type': 'function',
            'function': {
                'name': 'analyze_property_hazards',
                'description': 'Evaluates a San Diego property for Fire, Airport, and Coastal hazards.',
                'parameters': {
                    'type': 'object',
                    'properties': {
                        'address': {'type': 'string', 'description': 'The street address to check.'}
                    },
                    'required': ['address']
                }
            }
        },
        {
            'type': 'function',
            'function': {
                'name': 'search_pdf_handbook_tool',
                'description': 'Searches the ADU/zoning PDF handbook for rules, definitions, or procedures.',
                'parameters': {
                    'type': 'object',
                    'properties': {
                        'query': {'type': 'string', 'description': 'The topic to search for.'}
                    },
                    'required': ['query']
                }
            }
        },
        {
            'type': 'function',
            'function': {
                'name': 'search_ca_codes_tool',
                'description': 'Searches California legislative codes (Milvus). Use for CA code queries.',
                'parameters': {
                    'type': 'object',
                    'properties': {
                        'query': {'type': 'string', 'description': 'The code title or abbreviation to search for.'}
                    },
                    'required': ['query']
                }
            }
        },
    ]

    messages = [
        {
            'role': 'system',
            'content': (
                "You are an expert San Diego Real Estate AI. Use `analyze_property_hazards` for hazard zones, "
                "`search_pdf_handbook_tool` for handbook queries, and `search_ca_codes_tool` for CA legislative codes. "
                "Base answers entirely on retrieved data."
            )
        },
        {'role': 'user', 'content': user_prompt}
    ]

    try:
        response = await ollama_client.chat(model=MODEL_NAME, messages=messages, tools=tools)
        message = response['message']
        messages.append(message)

        tool_calls = message.get('tool_calls', [])
        content = message.get('content', '').strip()

        if not tool_calls and content and "{" in content:
            for candidate_tool_name in ("analyze_property_hazards", "search_pdf_handbook_tool", "search_ca_codes_tool"):
                if candidate_tool_name in content:
                    try:
                        parsed_json = json.loads(content)
                        params = parsed_json.get("parameters", {})
                        arg_key = "address" if candidate_tool_name == "analyze_property_hazards" else "query"
                        if arg_key in params:
                            tool_calls = [{
                                'function': {
                                    'name': candidate_tool_name,
                                    'arguments': {arg_key: params[arg_key]}
                                }
                            }]
                    except json.JSONDecodeError:
                        pass
                    break

        if not tool_calls:
            return {"message": content}

        for tool in tool_calls:
            tool_name = tool['function']['name']

            if tool_name == 'analyze_property_hazards':
                target_address = tool['function']['arguments']['address']
                tool_result = await analyze_property_hazards(target_address)
            elif tool_name == 'search_pdf_handbook_tool':
                target_query = tool['function']['arguments']['query']
                tool_result = await search_pdf_handbook_tool(target_query)
            elif tool_name == 'search_ca_codes_tool':
                target_query = tool['function']['arguments']['query']
                tool_result = await search_ca_codes_tool(target_query)
            else:
                continue

            messages.append({
                'role': 'tool',
                'name': tool_name,
                'content': json.dumps(tool_result)
            })

        final_response = await ollama_client.chat(model=MODEL_NAME, messages=messages)
        return {"message": final_response['message']['content']}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

app.mount("/sse", mcp.sse_app)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)