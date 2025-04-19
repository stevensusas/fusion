from fastmcp import FastMCP
import os
from MCPClient import MCPClient

# This code runs when the module is imported
# Get configuration from environment variables
github_pat = os.environ.get('GITHUB_PAT')
postgres_url = os.environ.get('POSTGRES_URL')
redis_url = os.environ.get('REDIS_URL')
sentry_auth_token = os.environ.get('SENTRY_AUTH_TOKEN')

use_github = bool(github_pat)
use_postgres = bool(postgres_url)
use_redis = bool(redis_url)
use_sentry = bool(sentry_auth_token)

# --- Github MCP ---
github_mcp = FastMCP("Github-MCP")

@github_mcp.tool()
async def github_tool(user_query: str): 
    client = MCPClient("../mcp-servers/src/github/dist/index.js", github_pat)
    response = await client.process_single_query(user_query)
    await client.cleanup()
    return response

# --- Postgres MCP ---
postgres_mcp = FastMCP("Postgres-MCP")
@postgres_mcp.tool()
async def postgres_tool(user_query: str):
    client = MCPClient("../mcp-servers/src/postgres/dist/index.js", postgres_url) 
    response = await client.process_single_query(user_query)
    await client.cleanup()
    return response

# --- Redis MCP ---
redis_mcp = FastMCP("Redis-MCP")

@redis_mcp.tool()
async def redis_tool(user_query: str):
    client = MCPClient("../mcp-servers/src/redis/dist/index.js", redis_url)
    response = await client.process_single_query(user_query)
    await client.cleanup()
    return response

# --- Sentry MCP ---
sentry_mcp = FastMCP("Sentry-MCP")

@sentry_mcp.tool()
async def sentry_tool(user_query: str):
    client = MCPClient("../mcp-servers/src/sentry/src/mcp_server_sentry/server.py", sentry_auth_token)
    response = await client.process_single_query(user_query)
    await client.cleanup()
    return response

# Create the composite MCP
mcp = FastMCP("Composite")

@mcp.tool()
def ping(): 
    return "Composite OK"

# Mount MCPs that have their environment variables set
if use_github:
    mcp.mount("github", github_mcp)
    
if use_postgres:
    mcp.mount("postgres", postgres_mcp)
    
if use_redis:
    mcp.mount("redis", redis_mcp)
    
if use_sentry:
    mcp.mount("sentry", sentry_mcp)

if __name__ == "__main__":    
    mcp.run()