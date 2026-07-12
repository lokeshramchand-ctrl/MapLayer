import ollama
import httpx
import json
import asyncio

# Point the Ollama client to your custom server
client = ollama.AsyncClient(host='http://10.10.10.100:11434')
MODEL_NAME = "llama3.1"  # Recommended for tool calling

async def chat_with_spatial_agent():
    print("Agent initializing...\n")
    
    user_prompt = "Can you check what zones 5000 Newport Ave comes under? Is it safe?"
    print(f"User: {user_prompt}\n")

    # Define the tool schema
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
    
    # System + user messages
    messages = [
        {'role': 'system', 'content': 'You are a San Diego Real Estate AI. If the user asks about a property, you MUST use the analyze_property_hazards tool to fetch the data. Do not guess.'},
        {'role': 'user', 'content': user_prompt}
    ]

    # 1. Send the prompt to Ollama
    response = await client.chat(model=MODEL_NAME, messages=messages, tools=tools)
    message = response['message']
    messages.append(message)
    
    tool_calls = message.get('tool_calls', [])
    content = message.get('content', '').strip()

    # Safety net for raw JSON output
    if not tool_calls and "analyze_property_hazards" in content and "{" in content:
        try:
            print("Agent output raw JSON instead of a tool call. Intercepting and fixing...")
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

    # If no tool calls, just print the content
    if not tool_calls:
        print("Agent answered directly (No tool used):")
        print(content)
        return

    # Execute the tool call
    for tool in tool_calls:
        if tool['function']['name'] == 'analyze_property_hazards':
            target_address = tool['function']['arguments']['address']
            print(f"Agent executing tool: analyze_property_hazards(address='{target_address}')")
            print("Fetching live data from backend...")

            async with httpx.AsyncClient(timeout=30.0) as http:
                # Geocode
                geo_res = await http.post("http://localhost:8000/api/geocode", json={"address": target_address})
                if geo_res.status_code != 200:
                    tool_result = {"error": "Address not found."}
                else:
                    coords = geo_res.json()["coordinates"]

                    # Parcel
                    parcel_res = await http.post("http://localhost:8000/api/parcel", json={
                        "longitude": coords[0],
                        "latitude": coords[1]
                    })

                    if parcel_res.status_code != 200:
                        tool_result = {"error": "Parcel not found."}
                    else:
                        geom = parcel_res.json()["geometry"]

                        # Zones
                        fire = await http.post("http://localhost:8000/api/zones/fire", json={"geometry": geom})
                        airport = await http.post("http://localhost:8000/api/zones/airport", json={"geometry": geom})
                        coastal = await http.post("http://localhost:8000/api/zones/coastal", json={"geometry": geom})

                        tool_result = {
                            "Fire Zone": fire.json()["intersects"],
                            "Airport Zone": airport.json()["intersects"],
                            "Coastal Zone": coastal.json()["intersects"]
                        }

            print(f"Backend returned data: {json.dumps(tool_result)}")

            # Feed the data back to Ollama
            messages.append({
                'role': 'tool',
                'name': tool['function']['name'],
                'content': json.dumps(tool_result)
            })

    # Final synthesized response from the LLM
    final_response = await client.chat(model=MODEL_NAME, messages=messages)
    print("\nFinal Agent Response:")
    print(final_response['message']['content'])


if __name__ == "__main__":
    asyncio.run(chat_with_spatial_agent())
