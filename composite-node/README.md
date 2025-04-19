# Fusion Composite Node Codebase

The source code for a Fusion composite node.

## Codebase structure

```/mcp-servers```: Contains source code for prebuilt MCP servers from Anthropic (https://github.com/modelcontextprotocol/servers). See ```/src``` for the full list.

In order to run the MCP servers, you must compile the Typescript servers into their Javascript equivalence. To do so, cd into ```/mcp-servers```. After ```npm install```, do ```npm run build```. The compiled JS files will be under ```/dist``` in each server codebase under ```/src```.

```/node```: Contains source code for the Fusion composite node. See directory README for more information.