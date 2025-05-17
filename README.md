# Fusion: Server-side MCP Orchestration

[Link to Slides](https://docs.google.com/presentation/d/1Nz4xa8kHiMg__8Uek5_Cq07a6mrCtS8q-oaCjpU1TM8/edit?usp=sharing)

https://github.com/user-attachments/assets/f5fddd03-9dcc-45ff-80b7-9ad89c7806a3

## Problem Statement

The Model Context Protocol (MCP), introduced by Anthropic in November 2024, is designed to be the "USB-C for your AI application"—a standardized mechanism for AI models to interact with external tools, resources, and context spaces. However, despite its potential, MCP's adoption faces a critical hurdle: orchestration complexity.

In the current ecosystem, every service provider builds and manages their own MCP server. Applications that aim to leverage multiple tools through MCP must handle the orchestration logic themselves—establishing and maintaining connections, monitoring uptime, managing routing logic, and ensuring protocol compliance. This creates:

1. A fragmented ecosystem with poor interoperability.

2. Significant overhead for host applications that need to manage multiple servers.

3. Barriers to scalability and maintainability in production systems.

The question arises: Can we abstract out this orchestration complexity to the server side?

## Intuition

Fusion draws its inspiration from a time-tested paradigm in distributed systems: load balancers. Just as load balancers intelligently route network requests to different servers while abstracting that complexity from clients, Fusion aims to do the same—but for MCP servers.

The guiding intuition is that orchestration logic, such as routing and connection management, should be delegated to an intermediate layer—an MCP-compliant server that acts as a router, aggregator, and orchestrator for downstream MCP servers.

## Implementation

Fusion is built around the idea of the MCP Composite Node, a novel abstraction that is:

1. Aggregative: Provides unified access to the context spaces of all its child MCP servers.

2. Autonomous: Makes internal routing decisions on which child MCP server(s) should handle an incoming request.

3. Conformant: Acts as an MCP server itself and strictly adheres to the MCP protocol (e.g., via Stdio/HTTP-SSE), ensuring seamless integration.

The Fusion architecture includes:

1. Multiple child MCP servers (e.g., for database, caching, monitoring).

2. A composite node that wraps and coordinates them.

3. Client sessions mapped to each server tool while maintaining distinct context spaces.

4. A Desktop GUI built on NextJS and ElectronJS, allowing developers to drag-and-drop MCP nodes and visually configure orchestration logic.

The Fusion Composite Node handles orchestration autonomously and presents a single MCP server interface to the client, hiding all downstream complexity.

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
