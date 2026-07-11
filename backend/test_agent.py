import ollama
import httpx
import json
import asyncio

# Point the Ollama client to your custom server
client = ollama.AsyncClient(host='http://ollama.splsystems.in:11434')

# We recommend llama3.1 or qwen2.5 for tool calling. Change if using a different model.
MODEL_NAME = "llama3.1" 

async def chat_with_spatial_agent():
    print("🤖 Agent initializing...\n")
    
    user_prompt = "Can you check what zones 5000 Newport ave comes under? Is it safe?"
    print(f"👤 User: {user_prompt}\n")

    # Define the tool schema so Ollama knows it exists
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
                        'description': 'The street address to check, e.g., "5000 Newport"'
                    }
                },
                'required': ['address']
            }
        }
    }]

    messages = [{'role': 'user', 'content': user_prompt}]

    # 1. Send the prompt to Ollama
    response = await client.chat(
        model=MODEL_NAME,
        messages=messages,
        tools=tools
    )

    messages.append(response['message'])

    # 2. Check if Ollama decided it needs to use the tool
    if not response['message'].get('tool_calls'):
        print("🤖 Agent answered directly (No tool used):")
        print(response['message']['content'])
        return

    # 3. Execute the tool call
    for tool in response['message']['tool_calls']:
        if tool['function']['name'] == 'analyze_property_hazards':
            target_address = tool['function']['arguments']['address']
            print(f"🛠️  Agent decided to use tool: analyze_property_hazards(address='{target_address}')")
            
            # Call your live FastAPI/MCP logic 
            # (If testing locally before deploying, change to http://localhost:8000/api/geocode etc., 
            # but since we built the Macro Tool, we can just hit the python logic if running in the same scope, 
            # OR make a quick HTTP POST to a dedicated macro endpoint. 
            # For this test, let's assume we mapped the macro tool to an API route for easy HTTP access).
            
            # To keep this test script completely detached and simple, let's simulate the MCP 
            # call by hitting your live endpoints sequentially just like the macro tool does.
            print("⏳ Fetching live data from backend...")
            
            # --- Simulated Macro Tool Execution for Test Script ---
            async with httpx.AsyncClient() as http:
                # Get coordinates
                geo_res = await http.post("https://backend.deploy.lokeshrc.me/api/geocode", json={"address": target_address})
                if geo_res.status_code != 200:
                    tool_result = {"error": "Address not found."}
                else:
                    # Get Parcel
                    coords = geo_res.json()["coordinates"]
                    parcel_res = await http.post("https://backend.deploy.lokeshrc.me/api/parcel", json={"longitude": coords[0], "latitude": coords[1]})
                    
                    if parcel_res.status_code != 200:
                        tool_result = {"error": "Parcel not found."}
                    else:
                        # Check Zones
                        geom = parcel_res.json()["geometry"]
                        fire = await http.post("https://backend.deploy.lokeshrc.me/api/zones/fire", json={"geometry": geom})
                        airport = await http.post("https://backend.deploy.lokeshrc.me/api/zones/airport", json={"geometry": geom})
                        coastal = await http.post("https://backend.deploy.lokeshrc.me/api/zones/coastal", json={"geometry": geom})
                        
                        tool_result = {
                            "Fire Zone": fire.json()["intersects"],
                            "Airport Zone": airport.json()["intersects"],
                            "Coastal Zone": coastal.json()["intersects"]
                        }
            
            print(f"📥 Tool returned data: {json.dumps(tool_result)}")
            
            # Feed the data back to Ollama to generate the final human-readable response
            messages.append({
                'role': 'tool',
                'name': tool['function']['name'],
                'content': json.dumps(tool_result)
            })

    # 4. Get the final synthesized response from the LLM
    final_response = await client.chat(model=MODEL_NAME, messages=messages)
    print("\n🤖 Final Agent Response:")
    print(final_response['message']['content'])

# Run the test
asyncio.run(chat_with_spatial_agent())