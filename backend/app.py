from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from mcp.server.fastmcp import FastMCP
import asyncio
import re
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
import ollama
import json
import uvicorn
from pymilvus import MilvusClient

app = FastAPI(title="ZoningLens")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows your React app to connect
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
mcp = FastMCP("SanDiegoSpatialAgent")
# --- MongoDB Connection ---
# Make sure to install motor: pip install motor
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

# Setup Ollama Client
ollama_client = ollama.AsyncClient(host='http://10.10.10.100:11434')

MODEL_NAME = "llama3.1"

# ==========================================
# PDF HANDBOOK RAG CONFIG
# (transplanted from RAG_PDF_Milvus.ipynb)
# ==========================================
EMBEDDING_MODEL = "nomic-embed-text-v2-moe:latest"
MILVUS_URI = "http://10.10.10.130:19530"
HANDBOOK_COLLECTION_NAME = "Zoning_Lens"
HANDBOOK_TOP_K = 5

# Reuse a single Milvus client for the life of the app, same as the notebook's
# `client = MilvusClient(uri=settings.milvus_uri)` pattern. Lazily connected so
# import/startup doesn't fail if Milvus happens to be unreachable at boot.
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


async def get_handbook_embedding(text: str) -> List[float]:
    """
    Async equivalent of the notebook's `get_embedding()`, but reuses the
    existing `ollama_client` already set up in this file instead of raw
    `requests.post` calls, so it plays nicely with FastAPI's event loop.
    """
    response = await ollama_client.embeddings(model=EMBEDDING_MODEL, prompt=text)
    return response["embedding"]


async def search_pdf_handbook(query: str, top_k: int = HANDBOOK_TOP_K) -> List[RetrievedChunk]:
    """
    Core retrieval logic transplanted from the notebook's `rag_query()`.
    Embeds the query, runs a Milvus similarity search against the
    Zoning_Lens collection, and returns the retrieved chunks (text, page,
    source, score) WITHOUT calling an LLM to synthesize an answer — that part
    is left to the caller (e.g. the MCP tool or a chat endpoint), since here
    we only want the retrieval step, not the notebook's `generate_answer()`.
    """
    query_vector = await get_handbook_embedding(query)

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


@mcp.tool()
async def search_pdf_handbook_tool(query: str, top_k: int = HANDBOOK_TOP_K) -> dict:
    """
    Searches the ADU/zoning PDF handbook (indexed in Milvus collection
    'Zoning_Lens') for passages relevant to `query`. Use this tool whenever a
    user asks a question about handbook rules, definitions, or procedures
    (e.g. "What are the setback requirements for an ADU?") rather than a
    specific property's hazard zones — that's what `analyze_property_hazards`
    is for.

    Returns the top matching chunks with their page number, source file, and
    similarity score so the calling LLM can ground its answer in the text.
    """
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


@app.post("/api/handbook/search")
async def handbook_search_endpoint(req: HandbookSearchRequest):
    """
    HTTP endpoint wrapping search_pdf_handbook() for direct use by the React
    frontend (bypasses the LLM tool-calling path in /api/chat).
    """
    top_k = req.top_k or HANDBOOK_TOP_K
    chunks = await search_pdf_handbook(req.query, top_k=top_k)
    if not chunks:
        raise HTTPException(status_code=404, detail="No relevant passages found in the handbook.")
    return {"query": req.query, "results": [c.model_dump() for c in chunks]}


# ==========================================
# ENDPOINT 1: Geocode (Address -> Point)
# ==========================================
@app.post("/api/geocode")
async def geocode_address(req: AddressRequest):
    address_str = req.address.strip()

    # 🧠 Regex logic to split "9121 Harmony Grove" into [9121, "Harmony Grove"]
    match = re.match(r"^(\d+)\s+(.*)", address_str)

    if match:
        addr_number = int(match.group(1))
        addr_name = match.group(2)
        primary_street = addr_name.split()[0]  # Helps catch variations like "Road" vs "Rd"

        query = {
            "properties.ADDRNMBR": addr_number,
            "properties.ADDRNAME": {"$regex": primary_street, "$options": "i"}
        }
    else:
        # Fallback if no number is provided
        query = {"properties.ADDRNAME": {"$regex": address_str, "$options": "i"}}

    # 🚀 Memory Optimization: Project only the point geometry and address names
    doc = await db.Address_Points_shapefile.find_one(
        query,
        {"geometry": 1, "properties.ADDRNMBR": 1, "properties.ADDRNAME": 1, "properties.ADDRSFX": 1, "_id": 0}
    )

    if not doc:
        raise HTTPException(status_code=404, detail="Address not found in database")

    props = doc.get("properties", {})

    # Clean up formatting in case of floats like "9121.0"
    raw_num = props.get('ADDRNMBR', '')
    house_num = int(raw_num) if isinstance(raw_num, float) and raw_num.is_integer() else raw_num

    found_address = f"{house_num} {props.get('ADDRNAME', '')} {props.get('ADDRSFX', '')}".strip()

    return {
        "formatted_address": found_address,
        "coordinates": doc["geometry"]["coordinates"],
        "point_geometry": doc["geometry"]
    }


# ==========================================
# ENDPOINT 2: Fetch Parcel Boundary
# ==========================================
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

    # 🚀 Memory Optimization: Do not return tax history, just geometry and APN
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

# ==========================================
# ENDPOINT 3: Fire Hazard Evaluation
# ==========================================
@app.post("/api/zones/fire")
async def check_fire_zone(req: PolygonRequest):
    spatial_query = {
        "geometry": {
            "$geoIntersects": {
                "$geometry": req.geometry
            }
        }
    }
    projection = {"geometry": 0, "_id": 0}

    doc = await db.Fire_Hazard_Severity_Zones_SD_shapefile.find_one(spatial_query, projection)

    return {
        "layer": "fire_zone",
        "intersects": bool(doc),
        "details": doc.get("properties", {}) if doc else None
    }

# ==========================================
# ENDPOINT 4: Airport Safety Evaluation
# ==========================================
@app.post("/api/zones/airport")
async def check_airport_zone(req: PolygonRequest):
    spatial_query = {
        "geometry": {
            "$geoIntersects": {
                "$geometry": req.geometry
            }
        }
    }
    projection = {"geometry": 0, "_id": 0}

    doc = await db.Airport_Safety_Zones_shapefile.find_one(spatial_query, projection)

    return {
        "layer": "airport_zone",
        "intersects": bool(doc),
        "details": doc.get("properties", {}) if doc else None
    }

# ==========================================
# ENDPOINT 5: Coastal Zone Evaluation
# ==========================================
@app.post("/api/zones/coastal")
async def check_coastal_zone(req: PolygonRequest):
    spatial_query = {
        "geometry": {
            "$geoIntersects": {
                "$geometry": req.geometry
            }
        }
    }
    projection = {"geometry": 0, "_id": 0}

    doc = await db.Coastal_Zones_shapefile.find_one(spatial_query, projection)

    return {
        "layer": "coastal_zone",
        "intersects": bool(doc),
        "details": doc.get("properties", {}) if doc else None
    }


@mcp.tool()
async def analyze_property_hazards(address: str) -> dict:
    """
    Evaluates a San Diego property for Fire, Airport, and Coastal hazards.
    Use this tool whenever a user asks if a property is safe, what zones it is in,
    or requests an analysis of a specific street address.
    """
    # 1. Geocode inside the tool (reusing your regex logic)
    address_str = address.strip()
    match = re.match(r"^(\d+)\s+(.*)", address_str)

    if match:
        addr_number, addr_name = int(match.group(1)), match.group(2)
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

    # 2. Get Parcel Boundary
    parcel_query = {"geometry": {"$geoIntersects": {"$geometry": point_geom}}}
    parcel_doc = await db.Parcels_shapefile.find_one(parcel_query, {"geometry": 1, "_id": 0})

    if not parcel_doc:
        return {"error": f"Found coordinates for '{address}', but no parcel boundary exists there."}

    parcel_geom = parcel_doc["geometry"]

    # 3. Check Zones Simultaneously
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

    # Return a clean summary directly to the LLM
    return dict(results)

@app.post("/api/chat")
async def chat_with_spatial_agent(req: ChatRequest):
    user_prompt = req.prompt

    # Define the tool schemas for Ollama
    tools = [
        {
            'type': 'function',
            'function': {
                'name': 'analyze_property_hazards',
                'description': 'Evaluates a San Diego property for Fire, Airport, and Coastal hazards.',
                'parameters': {
                    'type': 'object',
                    'properties': {
                        'address': {
                            'type': 'string',
                            'description': 'The street address to check, e.g., "5000 Newport Ave"'
                        }
                    },
                    'required': ['address']
                }
            }
        },
        {
            'type': 'function',
            'function': {
                'name': 'search_pdf_handbook_tool',
                'description': (
                    'Searches the ADU/zoning PDF handbook for passages relevant to a question '
                    'about rules, definitions, or procedures (not for property-specific hazard checks).'
                ),
                'parameters': {
                    'type': 'object',
                    'properties': {
                        'query': {
                            'type': 'string',
                            'description': 'The question or topic to search the handbook for, e.g., "ADU setback requirements"'
                        }
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
                "You are an expert San Diego Real Estate AI. You MUST use the analyze_property_hazards "
                "tool to answer property-specific hazard questions, and the search_pdf_handbook_tool "
                "to answer questions about handbook rules, definitions, or procedures. When analyzing "
                "results: 1. List the zones or handbook passages clearly. 2. Never attribute risks to a "
                "zone if the data says the property is not in that zone. 3. Ground handbook answers only "
                "in the retrieved passages, and say so if the handbook doesn't cover something."
            )
        },
        {'role': 'user', 'content': user_prompt}
    ]

    try:
        # 1. Send the prompt to Ollama
        response = await ollama_client.chat(model=MODEL_NAME, messages=messages, tools=tools)
        message = response['message']
        messages.append(message)

        tool_calls = message.get('tool_calls', [])
        content = message.get('content', '').strip()

        # --- Safety net for raw JSON output ---
        if not tool_calls and content and "{" in content:
            for candidate_tool_name in ("analyze_property_hazards", "search_pdf_handbook_tool"):
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

        # 2. If no tool calls, return the direct response
        if not tool_calls:
            return {"message": content}

        # 3. Execute the tool call(s) using the native functions
        for tool in tool_calls:
            tool_name = tool['function']['name']

            if tool_name == 'analyze_property_hazards':
                target_address = tool['function']['arguments']['address']
                tool_result = await analyze_property_hazards(target_address)

            elif tool_name == 'search_pdf_handbook_tool':
                target_query = tool['function']['arguments']['query']
                tool_result = await search_pdf_handbook_tool(target_query)

            else:
                continue

            # Feed the data back to Ollama
            messages.append({
                'role': 'tool',
                'name': tool_name,
                'content': json.dumps(tool_result)
            })

        # 4. Get the final synthesized response from the LLM
        final_response = await ollama_client.chat(model=MODEL_NAME, messages=messages)

        # Return to React frontend
        return {"message": final_response['message']['content']}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. Mount the MCP server to FastAPI
# This allows MCP Clients to connect via SSE at /sse
app.mount("/sse", mcp.sse_app)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)