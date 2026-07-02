from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient

app = FastAPI()

# MongoDB Connection
client = AsyncIOMotorClient("mongodb://lokesh:Lokesh%401234@10.10.10.110:27017/?authSource=admin")
db = client.geodata

# --- Pydantic Models for Clean Architecture ---
class AddressRequest(BaseModel):
    address: str

class PointRequest(BaseModel):
    longitude: float
    latitude: float

class PolygonRequest(BaseModel):
    layer_type: str # e.g., 'fire', 'airport', 'coastal'
    geometry: dict  # The GeoJSON polygon from the parcel response

# --- 1. Geocode Endpoint ---
@app.post("/api/geocode")
async def get_address_point(req: AddressRequest):
    # Assuming you have a text index on the address field
    doc = await db.Address_Points_shapefile.find_one({"address": req.address})
    if not doc:
        raise HTTPException(status_code=404, detail="Address not found")
    
    return {"point": doc["geometry"]}

# --- 2. Parcel Boundary Endpoint ---
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
    
    # Check the main parcel collection
    parcel = await db.Parcels_shapefile.find_one(query)
    
    if not parcel:
        raise HTTPException(status_code=404, detail="No parcel found at these coordinates")
        
    return {"parcel_id": parcel.get("APN"), "geometry": parcel["geometry"]}

# --- 3. Zone/Hazard Evaluation Endpoint ---
@app.post("/api/zones/check")
async def check_zone(req: PolygonRequest):
    # Map the requested layer to your specific MongoDB collection names
    collections = {
        "fire": db.Fire_Hazard_Severity_Zones_SD_shapefile,
        "airport": db.Airport_Safety_Zones_shapefile,
        "coastal": db.Coastal_Zones_shapefile
    }
    
    target_collection = collections.get(req.layer_type)
    if not target_collection:
        raise HTTPException(status_code=400, detail="Invalid layer type requested")

    query = {
        "geometry": {
            "$geoIntersects": {
                "$geometry": req.geometry
            }
        }
    }
    
    intersection = await target_collection.find_one(query)
    
    if intersection:
        return {
            "intersects": True, 
            "details": intersection.get("properties", {}) 
        }
        
    return {"intersects": False, "details": None}