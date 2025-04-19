from fastmcp import FastMCP

# --- Weather MCP ---
weather_mcp = FastMCP("Weather Service")

@weather_mcp.tool()
def get_forecast(city: str): 
    return f"Sunny in {city}"

@weather_mcp.resource("data://temp/{city}")
def get_temp(city: str): 
    return 25.0

# --- News MCP ---
news_mcp = FastMCP("News Service")

@news_mcp.tool()
def fetch_headlines():
    return ["Big news!", "Other news"]

@news_mcp.resource("data://latest_story")
def get_story():
    return "A story happened."

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