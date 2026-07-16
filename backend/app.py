from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from mcp.server.fastmcp import FastMCP
import asyncio
import re
from fastapi.middleware.cors import CORSMiddleware
import ollama
import json
import uvicorn

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

# Setup Ollama Client
ollama_client = ollama.AsyncClient(host='http://10.10.10.100:11434')
MODEL_NAME = "llama3.1"

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
        primary_street = addr_name.split()[0] # Helps catch variations like "Road" vs "Rd"
        
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

    # Define the tool schema for Ollama
    tools = [{
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
    }]
    
    messages = [
        {
            'role': 'system', 
            'content': (
                "You are an expert San Diego Real Estate AI. You MUST use the analyze_property_hazards "
                "tool to answer property questions. When analyzing results: 1. List the zones clearly. "
                "2. Never attribute risks to a zone if the data says the property is not in that zone."
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
        if not tool_calls and "analyze_property_hazards" in content and "{" in content:
            try:
                parsed_json = json.loads(content)
                if "parameters" in parsed_json and "address" in parsed_json["parameters"]:
                    extracted_address = parsed_json["parameters"]["address"]
                    tool_calls = [{
                        'function': {
                            'name': 'analyze_property_hazards',
                            'arguments': {'address': extracted_address}
                        }
                    }]
            except json.JSONDecodeError:
                pass

        # 2. If no tool calls, return the direct response
        if not tool_calls:
            return {"message": content}

        # 3. Execute the tool call using your highly optimized backend function!
        for tool in tool_calls:
            if tool['function']['name'] == 'analyze_property_hazards':
                target_address = tool['function']['arguments']['address']
                
                # NATIVE FUNCTION CALL: No HTTP overhead needed anymore!
                tool_result = await analyze_property_hazards(target_address)

                # Feed the data back to Ollama
                messages.append({
                    'role': 'tool',
                    'name': tool['function']['name'],
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