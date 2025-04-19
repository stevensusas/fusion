const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    // For a later stage, you might want to add more functionality
    // Example: send: (channel, data) => ipcRenderer.send(channel, data),
    // Example: receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
    getAppVersion: () => process.env.npm_package_version,
  }
); 