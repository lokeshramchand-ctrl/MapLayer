from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import PyMongoError
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
    geometry: dict  # Receives the entire GeoJSON polygon object from the parcel endpoint

# --- Health Check Endpoint ---
@app.get("/health")
async def health_check():
    try:
        await db.command("ping")
        return {"status": "ok", "mongodb": "connected"}
    except PyMongoError as e:
        return {"status": "error", "mongodb": f"not connected: {str(e)}"}

# --- 1. Geocode Endpoint ---
@app.post("/api/geocode")
async def get_address_point(req: AddressRequest):
    # NOTE: Shapefile imports via ogr2ogr usually nest attributes inside 'properties'.
    # If your field is flat, change this back to {"address": req.address}
    query = {
        "$or": [
            {"properties.address": req.address},
            {"properties.ADDRESS": req.address},
            {"address": req.address} 
        ]
    }
    
    doc = await db.Address_Points_shapefile.find_one(query)
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
    
    # List all your parcel collections to ensure full geographic coverage of San Diego
    parcel_collections = [
        db.Parcels_shapefile,
        db.Parcels_North_shapefile,
        db.Parcels_South_shapefile,
        db.Parcels_East_shapefile
    ]
    
    # Check collections concurrently to see which one contains the point
    async def check_collection(coll):
        try:
            return await coll.find_one(query)
        except Exception:
            return None

    tasks = [check_collection(c) for c in parcel_collections]
    results = await asyncio.gather(*tasks)
    
    # Extract the first non-null parcel found
    parcel = next((r for r in results if r is not None), None)
    
    if not parcel:
        raise HTTPException(status_code=404, detail="No parcel found at these coordinates")
        
    # Handle variations in shapefile attribute casing safely
    properties = parcel.get("properties", {})
    apn = properties.get("APN") or properties.get("apn") or parcel.get("APN")
        
    return {"parcel_id": apn, "geometry": parcel["geometry"]}

# --- 3. Master Zone/Hazard Evaluation Endpoint ---
# This single endpoint evaluates ALL zones at the exact same time
@app.post("/api/zones/check")
async def check_all_zones(req: PolygonRequest):
    query = {
        "geometry": {
            "$geoIntersects": {
                "$geometry": req.geometry
            }
        }
    }
    
    # Internal helper function to run queries across layers in parallel
    async def evaluate_layer(collection, layer_name):
        doc = await collection.find_one(query)
        if doc:
            return layer_name, {
                "intersects": True,
                "details": doc.get("properties", {})
            }
        return layer_name, {
            "intersects": False,
            "details": None
        }

    # Execute all 3 geographic layer evaluations completely in parallel
    results = await asyncio.gather(
        evaluate_layer(db.Fire_Hazard_Severity_Zones_SD_shapefile, "fire"),
        evaluate_layer(db.Airport_Safety_Zones_shapefile, "airport"),
        evaluate_layer(db.Coastal_Zones_shapefile, "coastal")
    )
    
    # Merges the gathered tuples into a single, clean JSON dictionary response
    return dict(results)