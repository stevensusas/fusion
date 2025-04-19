# Fusion: Server-side MCP Orchestration

## Setup (For first time after cloning the repository)

1. ```cd fusion-app && npm install```
2. ```cd fusion-desktop && npm install```
3. ```cd composite-node/mcp-servers && npm install && npm run build ```
4. Add your Anthropic API key to a .env file in the root directory

After these steps you're all set for future usage!

## Usage

```cd fusio-desktop && npm start```

Enjoy!

## Repository Structure

```/composite-node```: source code for the Fusion composite node, MCP servers that bridges model context spaces of children MCP servers. See Directory README for more.

```/fusion-app```: NextJS webapp for the GUI of the Fusion platform

```/fusion-desktop```: ElectronJS wrapper for the Fusion GUI, allow running Fusion platform on MacOS as a Desktop application
