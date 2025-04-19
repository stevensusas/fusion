const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const process = require('process');
const url = require('url');

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;
let nextApp;
const isDev = true; // Set to false for production builds
const nextDir = path.join(__dirname, '../fusion-app');
const port = 3000;

function startNextDev() {
  console.log('Starting Next.js dev server...');
  nextApp = spawn('npm', ['run', 'dev'], { 
    cwd: nextDir,
    shell: true,
    env: process.env,
    stdio: 'inherit'
  });

  nextApp.on('error', (err) => {
    console.error('Failed to start Next.js server:', err);
  });

  // Wait for the server to start
  return new Promise((resolve) => {
    // Give it a few seconds to start
    setTimeout(resolve, 3000);
  });
}

const createWindow = async () => {
  if (isDev) {
    await startNextDev();
  }

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Load the Next.js app - specifically the home page
  const startUrl = isDev 
    ? `http://localhost:${port}` 
    : url.format({
        pathname: path.join(__dirname, '../fusion-app/out/index.html'),
        protocol: 'file:',
        slashes: true,
      });
      
  mainWindow.loadURL(startUrl);

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (nextApp) {
    nextApp.kill('SIGINT');
  }
}); 