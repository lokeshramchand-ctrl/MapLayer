from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def test_connection():
    client = AsyncIOMotorClient("mongodb://lokesh:Lokesh%401234@10.10.10.110:27017/?authSource=admin")
    db = client["geodata"]
    collections = await db.list_collection_names()
    print("✅ Connected! Collections:", collections)

asyncio.run(test_connection())
