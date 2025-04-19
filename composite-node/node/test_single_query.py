import asyncio
from MCPClient import MCPClient

async def main():
    client = MCPClient("../mcp-servers/src/github/dist/index.js")
    response = await client.process_single_query("What is the latest version of the React library?")
    await client.cleanup()
    return response

if __name__ == "__main__":
    response = asyncio.run(main()) 
    print(response)