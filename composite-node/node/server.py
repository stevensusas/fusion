from fastmcp import FastMCP
import os
from MCPClient import MCPClient

# --- Github MCP ---
github_mcp = FastMCP("Github-MCP")

@github_mcp.tool()
async def github_tool(user_query: str): 
    client = MCPClient("../mcp-servers/src/github/dist/index.js")
    response = await client.process_single_query(user_query)
    await client.cleanup()
    return response

# --- Postgres MCP ---
postgres_mcp = FastMCP("Postgres-MCP")
@postgres_mcp.tool()
async def postgres_tool(user_query: str):
    client = MCPClient("../mcp-servers/src/postgres/dist/index.js") 
    response = await client.process_single_query(user_query)
    await client.cleanup()
    return response

# --- Redis MCP ---
redis_mcp = FastMCP("Redis-MCP")

@redis_mcp.tool()
async def redis_tool(user_query: str):
    client = MCPClient("../mcp-servers/src/redis/dist/index.js")
    response = await client.process_single_query(user_query)
    await client.cleanup()
    return response

# --- Sentry MCP ---
sentry_mcp = FastMCP("Sentry-MCP")

@sentry_mcp.tool()
async def sentry_tool(user_query: str):
    client = MCPClient("../mcp-servers/src/sentry/src/mcp_server_sentry/server.py")
    response = await client.process_single_query(user_query)
    await client.cleanup()
    return response

# Create the composite MCP
mcp = FastMCP("Composite")

@mcp.tool()
def ping(): 
    return "Composite OK"

# This code runs when the module is imported
# Get configuration from environment variables
use_github = os.environ.get('ENABLE_GITHUB', '0') == '1'
use_postgres = os.environ.get('ENABLE_POSTGRES', '0') == '1'
use_redis = os.environ.get('ENABLE_REDIS', '0') == '1'
use_sentry = os.environ.get('ENABLE_SENTRY', '0') == '1'

# If no specific MCPs are enabled, include all of them
include_all = not (use_github or use_postgres or use_redis or use_sentry)

# Mount selected sub-apps
if use_github or include_all:
    mcp.mount("github", github_mcp)
    
if use_postgres or include_all:
    mcp.mount("postgres", postgres_mcp)
    
if use_redis or include_all:
    mcp.mount("redis", redis_mcp)
    
if use_sentry or include_all:
    mcp.mount("sentry", sentry_mcp)

if __name__ == "__main__":    
    mcp.run()