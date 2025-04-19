from fastmcp import FastMCP

# --- Github MCP ---
github_mcp = FastMCP("Github-MCP")

@github_mcp.tool()
def github_mcp(): 
    return "Github MCP"

# --- Postgres MCP ---
postgres_mcp = FastMCP("Postgres-MCP")

@postgres_mcp.tool()
def postgres_mcp():
    return "Postgres MCP"

# --- Redis MCP ---
redis_mcp = FastMCP("Redis-MCP")

@redis_mcp.tool()
def redis_mcp():
    return "Redis MCP"

# --- Sentry MCP ---
sentry_mcp = FastMCP("Sentry-MCP")

@sentry_mcp.tool()
def sentry_mcp():
    return "Sentry MCP"

# --- Composite MCP ---

mcp = FastMCP("Composite")

# Mount sub-apps with prefixes
mcp.mount("weather", weather_mcp) # Tools prefixed "weather/", resources prefixed "weather+"
mcp.mount("news", news_mcp)       # Tools prefixed "news/", resources prefixed "news+"

@mcp.tool()
def ping(): 
    return "Composite OK"

if __name__ == "__main__":
    mcp.run()