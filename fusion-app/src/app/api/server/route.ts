import { NextRequest, NextResponse } from 'next/server';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';

// Store running server processes
const runningServers: Map<string, {
  process: ChildProcess;
  port: number;
  url: string;
}> = new Map();

// Get a random port between 8000 and 9000
const getRandomPort = (): number => {
  return Math.floor(Math.random() * 1000) + 8000;
};

// Format service flags for command line
const formatServiceFlags = (services: any[]): string[] => {
  const flags: string[] = [];

  services.forEach((service) => {
    switch (service.name.toLowerCase()) {
      case 'github':
        flags.push(`--GITHUB_PAT=${service.config}`);
        break;
      case 'postgresql':
      case 'postgres':
        flags.push(`--POSTGRES_URL=${service.config}`);
        break;
      case 'redis':
        flags.push(`--REDIS_URL=${service.config}`);
        break;
      case 'sentry':
        flags.push(`--SENTRY_AUTH_TOKEN=${service.config}`);
        break;
      default:
        console.warn(`Unknown service type: ${service.name}`);
    }
  });

  return flags;
};

// Start server handler
async function startServer(serverId: string, services: any[]) {
  // If server is already running, return its URL
  if (runningServers.has(serverId)) {
    return { url: runningServers.get(serverId)!.url };
  }

  // Get a random port
  const port = getRandomPort();
  const serverUrl = `http://localhost:${port}`;

  // Format service flags
  const serviceFlags = formatServiceFlags(services);

  try {
    // Determine the path to the composite server directory
    // Using relative path from the current project root
    const serverDir = path.join(process.cwd(), '..', 'composite-node', 'node');
    
    // Build the command
    const command = 'uv';
    const args = [
      'run',
      'python',
      'composite_server.py',
      'server.py',
      '--api',
      `--port=${port}`,
      ...serviceFlags
    ];

    console.log(`Starting server with command: ${command} ${args.join(' ')}`);
    console.log(`Working directory: ${serverDir}`);

    // Spawn the process
    const serverProcess = spawn(command, args, {
      cwd: serverDir,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    // Store the process
    runningServers.set(serverId, {
      process: serverProcess,
      port,
      url: serverUrl
    });

    // Log output
    serverProcess.stdout.on('data', (data) => {
      console.log(`[Server ${serverId}] ${data.toString().trim()}`);
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`[Server ${serverId} ERROR] ${data.toString().trim()}`);
    });

    // Handle process exit
    serverProcess.on('exit', (code) => {
      console.log(`Server ${serverId} exited with code ${code}`);
      runningServers.delete(serverId);
    });

    // Wait for the server to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    return { url: serverUrl };
  } catch (error) {
    console.error('Failed to start server:', error);
    throw new Error('Failed to start server');
  }
}

// Stop server handler
function stopServer(serverId: string) {
  const server = runningServers.get(serverId);
  if (!server) {
    return { success: false };
  }

  try {
    // Kill the process
    server.process.kill();
    runningServers.delete(serverId);
    return { success: true };
  } catch (error) {
    console.error(`Failed to stop server ${serverId}:`, error);
    return { success: false };
  }
}

// Get server status handler
function getServerStatus(serverId: string) {
  const server = runningServers.get(serverId);
  return { 
    running: !!server,
    url: server ? server.url : null
  };
}

// API route handler
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { action, serverId, services } = data;

    switch (action) {
      case 'start':
        const startResult = await startServer(serverId, services);
        return NextResponse.json(startResult);
      
      case 'stop':
        const stopResult = stopServer(serverId);
        return NextResponse.json(stopResult);
      
      case 'status':
        const statusResult = getServerStatus(serverId);
        return NextResponse.json(statusResult);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Server API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 