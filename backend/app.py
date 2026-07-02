from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import PyMongoError
app = FastAPI()

# MongoDB Connection
client = AsyncIOMotorClient("mongodb://lokesh:Lokesh%401234@10.10.10.110:27017/?authSource=admin")
db = client.geodata
# --- Pydantic Schemas ---
class AddressRequest(BaseModel):
    address: str

class PointRequest(BaseModel):
    longitude: float
    latitude: float

class HazardCheckRequest(BaseModel):
    geometry: dict  # Expects the GeoJSON Polygon object from the parcel step

# --- Endpoint 1: Geocode Address ---
@app.post("/api/geocode")
async def geocode_address(req: AddressRequest):
    # Highly efficient indexed text search or exact match
    doc = await db.Address_Points_shapefile.find_one(
        {"properties.ADDRESS": req.address}, # Adjust field name based on your schema
        {"geometry": 1, "_id": 0}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Address not found in database")
    
    return {"coordinates": doc["geometry"]["coordinates"]}

# --- Endpoint 2: Fetch Parcel Boundary ---
@app.post("/api/parcel")
async def get_parcel_boundary(req: PointRequest):
    spatial_query = {
        "geometry": {
            "$geoIntersects": {
                "$geometry": {
                    "type": "Point",
                    "coordinates": [req.longitude, req.latitude]
                }
            }
        }
    }
    
    # Querying the unified view handles all geographic zones in a single high-speed pass
    parcel = await db.All_Parcels_Unified.find_one(
        spatial_query,
        {"geometry": 1, "properties.APN": 1, "_id": 0}
    )
    
    if not parcel:
        raise HTTPException(status_code=404, detail="No parcel boundary found for these coordinates")
        
    return {
        "apn": parcel["properties"].get("APN"),
        "geometry": parcel["geometry"]
    }

# --- Endpoint 3: Concurrent Hazard Zone Evaluation ---
@app.post("/api/zones/check")
async def check_property_hazards(req: HazardCheckRequest):
    spatial_query = {
        "geometry": {
            "$geoIntersects": {
                "$geometry": req.geometry # The full property boundary polygon
            }
        }
    }

    # Helper function to query individual collections concurrently
    async def check_layer(collection, layer_name):
        match = await collection.find_one(spatial_query, {"properties": 1, "_id": 0})
        return layer_name, {"intersects": bool(match), "details": match.get("properties") if match else None}

    # Execute all database spatial evaluations simultaneously via the async event loop
    results = await asyncio.gather(
        check_layer(db.Fire_Hazard_Severity_Zones_SD_shapefile, "fire_zone"),
        check_layer(db.Airport_Safety_Zones_shapefile, "airport_zone"),
        check_layer(db.Coastal_Zones_shapefile, "coastal_zone")
    )

    # Convert the gathered tuple results back into a clean dictionary payload
    return dict(results)