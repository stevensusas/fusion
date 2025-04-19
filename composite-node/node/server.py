from fastmcp import FastMCP
import os
from MCPClient import MCPClient

# --- Github MCP ---
github_mcp = FastMCP("Github-MCP")

@github_mcp.tool()
def github_tool(): 
    return "Github OK"

# --- Postgres MCP ---
postgres_mcp = FastMCP("Postgres-MCP")

@postgres_mcp.tool()
def postgres_tool():
    return "Github OK"

# --- Redis MCP ---
redis_mcp = FastMCP("Redis-MCP")

@redis_mcp.tool()
def redis_tool():
    return "Github OK"

# --- Sentry MCP ---
sentry_mcp = FastMCP("Sentry-MCP")

@sentry_mcp.tool()
def sentry_tool():
    return "Sentry OK"

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