import asyncio
import argparse
from typing import Optional
from contextlib import AsyncExitStack

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from anthropic import Anthropic
from dotenv import load_dotenv
import os

load_dotenv()  # load environment variables from .env
github_pat = os.environ.get('GITHUB_PAT')
postgres_url = os.environ.get('POSTGRES_URL')
redis_url = os.environ.get('REDIS_URL')
sentry_auth_token = os.environ.get('SENTRY_AUTH_TOKEN')

class CompositeServer:
    def __init__(self, server_script_path: str, github_pat: Optional[str] = None, postgres_url: Optional[str] = None, redis_url: Optional[str] = None, sentry_auth_token: Optional[str] = None):
        # Initialize session and client objects
        self.session: Optional[ClientSession] = None
        self.exit_stack = AsyncExitStack()
        self.anthropic = Anthropic()
        self.model = "claude-3-5-sonnet-20241022"
        self.max_tokens = 1000
        self.server_script_path = server_script_path
        self.github_pat = github_pat
        self.postgres_url = postgres_url
        self.redis_url = redis_url
        self.sentry_auth_token = sentry_auth_token

    async def connect_to_server(self):
        """Connect to an MCP server"""
        server_script_path = self.server_script_path
        is_python = server_script_path.endswith('.py')
        is_js = server_script_path.endswith('.js')
        if not (is_python or is_js):
            raise ValueError("Server script must be a .py or .js file")
            
        command = "python" if is_python else "node"
        
        # Create a clean environment dictionary, filtering out None values
        env_dict = {}
        if self.github_pat:
            env_dict["GITHUB_PAT"] = self.github_pat
        if self.postgres_url:
            env_dict["POSTGRES_URL"] = self.postgres_url
        if self.redis_url:
            env_dict["REDIS_URL"] = self.redis_url
        if self.sentry_auth_token:
            env_dict["SENTRY_AUTH_TOKEN"] = self.sentry_auth_token
            
        # Create server parameters with the environment dictionary
        server_params = StdioServerParameters(
            command=command,
            args=[server_script_path],
            env=env_dict
        )
        
        stdio_transport = await self.exit_stack.enter_async_context(stdio_client(server_params))
        self.stdio, self.write = stdio_transport
        self.session = await self.exit_stack.enter_async_context(ClientSession(self.stdio, self.write))
        
        await self.session.initialize()
        
        # List available tools
        response = await self.session.list_tools()
        tools = response.tools
        print("\nConnected to server with tools:", [tool.name for tool in tools])

    async def process_query(self, query: str) -> str:
        """Process a query using Claude and available tools"""
        messages = [
            {
                "role": "user",
                "content": query
            }
        ]

        response = await self.session.list_tools()
        available_tools = [{ 
            "name": tool.name,
            "description": tool.description,
            "input_schema": tool.inputSchema
        } for tool in response.tools]

        # Initial Claude API call
        response = self.anthropic.messages.create(
            model=self.model,
            max_tokens=self.max_tokens,
            messages=messages,
            tools=available_tools
        )

        # Process response and handle tool calls
        final_text = []

        for content in response.content:
            if content.type == 'text':
                final_text.append(content.text)
            elif content.type == 'tool_use':
                tool_name = content.name
                tool_args = content.input
                
                # Execute tool call
                result = await self.session.call_tool(tool_name, tool_args)
                final_text.append(f"[Calling tool {tool_name} with args {tool_args}]")

                # Continue conversation with tool results
                if hasattr(content, 'text') and content.text:
                    messages.append({
                      "role": "assistant",
                      "content": content.text
                    })
                messages.append({
                    "role": "user", 
                    "content": result.content
                })

                # Get next response from Claude
                response = self.anthropic.messages.create(
                    model=self.model,
                    max_tokens=self.max_tokens,
                    messages=messages,
                )

                final_text.append(response.content[0].text)

        return "\n".join(final_text)

    async def process_single_query(self, query: str) -> str:
        """Process a single query and return a direct response
        
        Args:
            query: The user's query string
            
        Returns:
            A single response string
        """
        await self.connect_to_server()
        return await self.process_query(query)

    async def chat_loop(self):
        """Run an interactive chat loop"""
        print("\nMCP Client Started!")
        print("Type your queries or 'quit' to exit.")
        
        while True:
            try:
                query = input("\nQuery: ").strip()
                
                if query.lower() == 'quit':
                    break
                    
                response = await self.process_query(query)
                print("\n" + response)
                    
            except Exception as e:
                print(f"\nError: {str(e)}")
    
    async def cleanup(self):
        """Clean up resources"""
        await self.exit_stack.aclose()

async def main():
    parser = argparse.ArgumentParser(description='MCP Client')
    parser.add_argument('server_script', help='Path to the server script (.py or .js)')
    parser.add_argument('--GITHUB_PAT', help='Environment variable to pass to the server script', default=None)
    parser.add_argument('--POSTGRES_URL', help='Environment variable to pass to the server script', default=None)
    parser.add_argument('--REDIS_URL', help='Environment variable to pass to the server script', default=None)
    parser.add_argument('--SENTRY_AUTH_TOKEN', help='Environment variable to pass to the server script', default=None)
    args = parser.parse_args()
    
    client = CompositeServer(args.server_script, args.GITHUB_PAT, args.POSTGRES_URL, args.REDIS_URL, args.SENTRY_AUTH_TOKEN)
    try:
        await client.connect_to_server()
        
        await client.chat_loop()
    finally:
        await client.cleanup()

if __name__ == "__main__":
    asyncio.run(main())