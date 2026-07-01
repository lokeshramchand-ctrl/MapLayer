from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient("mongodb://mongo.splsystems.in:27017/geodata")
db = client["geodata"]

async def test_connection():
    names = await db.list_collection_names()
    print("Collections:", names)

await test_connection()
