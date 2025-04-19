# Fusion Composite Node source code

Before you try to run anything under this directory, make sure your Anthropic API key has been set in the repository root's .env file. See .env.example.

You might also have to do ```uv install``` and ```uv sync``` to ensure your Python environment is correct.

## Repository Structure

```MCPClient.py```: contains ```MCPClient```, a class that manage a client connection to a MCP server
```server.py```: Coordinator layer of the Fusion Composite node. Itself a MCP server built with fastmcp, this server is able to call tools that direct a user query to other MCP servers through initialization of ```MCPClient``` classes.
```composite_server.py```: FastAPI wrapper of ```server.py```. A lightweight RESTful layer that enables a chatbot demo between the user and the Fusion Composite node on the Fusion platform.

## Usage

To run a chat session on the commandline with a specific base MCP server using the ```MCPClient``` class:
- Run ```uv run MCPClient.py [path]```
    - ```path = ../mcp-servers/src/github/dist/index.js``` for Github MCP
    - ```path = ../mcp-servers/src/postgres/dist/index.js``` for PostgreSQL MCP
    - ```path = ../mcp-servers/src/redis/dist/index.js``` for Redis MCP
    - ```path = ../mcp-servers/src/sentry/dist/server.py``` for Sentry MCP
You should be able to see an interactive conversation session pop up on your commandline.

To run the composite MCP server in development mode:
- ```uv run fastmcp dev server.py```
- Go to http://127.0.0.1:6274. You can configure environmental variables ```GITHUB_PAT```, ```POSTGRES_URL```, ```SENTRY_AUTH_TOKEN```, and ```REDIS_URL``` there.

To interact with the composite MCP server on the commandline:
- ```uv run python composite_server.py server.py --GITHUB_PAT=example --POSTGRES_URL=example --SENTRY_AUTH_TOKEN=example --REDIS_URL=example```
You should be able to see an interactive conversation session pop up on your commandline.

To run the FastAPI RESTful layer:
```uv run python composite_server.py server.py --api --port=8000 --GITHUB_PAT=example --POSTGRES_URL=example --SENTRY_AUTH_TOKEN=example --REDIS_URL=example```
You can then send RESTful requests to ```localhost:8000``` to interact with the composite MCP server.