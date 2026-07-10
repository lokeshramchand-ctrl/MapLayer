from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import re

import uvicorn

app = FastAPI(title="ZoningLens")

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