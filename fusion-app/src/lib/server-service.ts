import { spawn, ChildProcess } from 'child_process';
import path from 'path';

// Define service types
type ServiceConfig = {
  name: string;
  config: string;
};

// Cache server URLs
const serverUrlCache: Map<string, string> = new Map();

// Get a random port between 8000 and 9000
const getRandomPort = (): number => {
  return Math.floor(Math.random() * 1000) + 8000;
};

// Format service flags for command line
const formatServiceFlags = (services: ServiceConfig[]): string[] => {
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

// Start a composite server
export const startServer = async (serverId: string, services: ServiceConfig[]): Promise<string> => {
  // If we have a cached URL for this server, check if it's still running
  if (serverUrlCache.has(serverId)) {
    // Check server status
    const isRunning = await checkServerStatus(serverId);
    if (isRunning) {
      return serverUrlCache.get(serverId)!;
    }
  }

  try {
    // Call the API to start the server
    const response = await fetch('/api/server', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'start',
        serverId,
        services
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to start server');
    }

    const data = await response.json();
    
    // Cache the URL for future reference
    if (data.url) {
      serverUrlCache.set(serverId, data.url);
    }
    
    return data.url;
  } catch (error) {
    console.error('Failed to start server:', error);
    throw error;
  }
};

// Stop a running server
export const stopServer = async (serverId: string): Promise<boolean> => {
  try {
    // Call the API to stop the server
    const response = await fetch('/api/server', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'stop',
        serverId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to stop server');
    }

    const data = await response.json();
    
    // Clear the URL from cache if we successfully stopped the server
    if (data.success) {
      serverUrlCache.delete(serverId);
    }
    
    return data.success;
  } catch (error) {
    console.error('Failed to stop server:', error);
    return false;
  }
};

// Check if a server is running
export const checkServerStatus = async (serverId: string): Promise<boolean> => {
  try {
    // Call the API to check server status
    const response = await fetch('/api/server', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'status',
        serverId
      })
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.running;
  } catch (error) {
    console.error('Failed to check server status:', error);
    return false;
  }
};

// Get server URL
export const getServerUrl = (serverId: string): string | null => {
  return serverUrlCache.get(serverId) || null;
}; 