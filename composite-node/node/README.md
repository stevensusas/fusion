# Starter code to build composite MCP servers

server.py [Docs at https://github.com/jlowin/fastmcp?tab=readme-ov-file#running-your-server]

- Starter code to build a composite MCP server with capability to mount multiple pre-built third party MCP servers
- To run in development mode (for debugging and initial testing): 
    - Make sure you're in the /client directory
    - Run cli "uv install" (this step might not be necessary, lmk)
    - Run cli ". .venv/bin/activate"
    - Run cli "fastmcp dev server.py"
    - Go to http://127.0.0.1:6274
- To run in production mode:
    - Download Claude Desktop (https://claude.ai/download)
    - Login to and setup Claude Desktop
    - Make sure you're in the /client directory
    - Run cli "uv install" (this step might not be necessary, lmk)
    - Run cli ". .venv/bin/activate"
    - Run cli "fastmcp install server.py"
    - Go to Claude Desktop and start a conversation, you should be able to see Claude Desktop has picked up on the tools provided by the MCP server

MCPClient.py [Docs: https://modelcontextprotocol.io/quickstart/client]

- Starter code, a chat application that allows you to chat with an agent with access to a specified third-party MCP server on the cli
- You can chat with Github, PostgreSQL, Redis, and Sentry MCP Servers. Source code for these servers are found in /root/composite-node/mcp_servers/src
- To run:
    - go to /composite-node/mcp-servers directory
    - Run cli "npm install"
    - Run cli "npm run build"
    - go to /composite-node/client directory
    - Run cli "npm install"
    - Run cli "uv install" (might not be necessary)
    - Run cli "uv run MCPClient.py [path]"
        - path = ../mcp-servers/src/github/dist/index.js for Github MCP
        - path = ../mcp-servers/src/postgres/dist/index.js for PostgreSQL MCP
        - path = ../mcp-servers/src/redis/dist/index.js for Redis MCP
        - path = ../mcp-servers/src/sentry/dist/server.py for Sentry MCP
    - You should be able to see an interactive conversation session pop up on your commandline

Have fun building from here!
        