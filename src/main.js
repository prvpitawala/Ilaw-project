const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const http = require('http');
const { setupApiHandlers } = require('./api/apiApplication.js');
const log = require('electron-log');

// Configuration
const CONFIG = {
  flaskHost: '127.0.0.1',
  flaskPort: 5000,
  healthEndpoint: '/health',
  startupTimeout: 60000,    // 60 seconds max wait time
  retryInterval: 5000,       // 500ms between retries
  flaskStartupGracePeriod: 2000, // Wait 2s before first healthcheck
  windowConfig: {
    width: 600,
    height: 400,
    center: true,
    resizable: false,
    titleBarStyle: 'hidden',
    ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  }
};

let mainWindow = null;

// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

// async function checkServer() {
//     return new Promise((resolve) => {
//         http.get('http://127.0.0.1:5000/verify', (res) => {
//             resolve(res.statusCode === 200);
//         }).on('error', () => {
//             resolve(false);
//         });
//     });
// }

// async function waitForFlask() {
//     console.log(`Waiting for Flask server to start...`);

//     let attempts = 0;
//     const maxAttempts = 40;

//     while (attempts < maxAttempts) {
//         console.log(`Attempt ${attempts + 1}...`);
//         const isRunning = await checkServer();
//         if (isRunning) return true;
//         await sleep(5000); // Wait 5 seconds
//         attempts++;
//     }

//     return false;
// }

// Create the main application window

const createWindow = () => {
    mainWindow = new BrowserWindow({
        ...CONFIG.windowConfig,
        icon: path.join(__dirname, 'icon.png'),
        frame: false,   
        show: false,
        
    });

    mainWindow.loadFile('src/loading.html');
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
};

function checkFlaskHealth() {
  return new Promise((resolve) => {
    const options = {
      hostname: CONFIG.flaskHost,
      port: CONFIG.flaskPort,
      path: CONFIG.healthEndpoint,
      method: 'GET',
      timeout: 2000 // 2s timeout for the HTTP request itself
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const responseData = JSON.parse(data);
            // Verify the response contains the expected fields
            if (responseData.status === 'healthy') {
              log.debug('Flask health check passed');
              resolve(true);
            } else {
              log.warn('Flask returned non-healthy status:', responseData);
              resolve(false);
            }
          } catch (e) {
            log.warn('Failed to parse Flask health response:', e);
            resolve(false);
          }
        } else {
          log.warn(`Flask returned non-200 status: ${res.statusCode}`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      log.debug(`Health check failed: ${error.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      log.debug('Health check request timed out');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

async function waitForFlaskReady() {
    log.info('Waiting for Flask server to be ready...');
    
    // Give Flask a moment to start up
    //   await new Promise(resolve => setTimeout(resolve, CONFIG.flaskStartupGracePeriod));
    
    const startTime = Date.now();
    const endTime = startTime + CONFIG.startupTimeout;
    
    let attempt = 1;
    
    while (Date.now() < endTime) {
        log.debug(`Health check attempt ${attempt++}`);
        
        const isReady = await checkFlaskHealth();
        if (isReady) {
        const timeElapsed = Date.now() - startTime;
        log.info(`Flask server ready after ${timeElapsed}ms`);
        return true;
        }
        
        // Don't hammer the server, wait between retries
        await new Promise(resolve => setTimeout(resolve, CONFIG.retryInterval));
    }
    
    log.error(`Flask server failed to start within ${CONFIG.startupTimeout}ms`);
    return false;
}

// Load the actual app after Flask is ready
const loadMainApp = () => {
    if (!mainWindow) return;
    mainWindow.setResizable(true);    // Enable resizing after full load
    mainWindow.setBounds({ width: 1000, height: 700 });
    mainWindow.setMinimumSize(340, 500); 
    mainWindow.center();              // Re-center after resize
    mainWindow.loadFile('src/index.html');
};

function showError(message) {
  log.error(message);
  if (mainWindow) {
    mainWindow.webContents.executeJavaScript(`
      document.body.innerHTML = '<div class="error-container">
        <h2>Application Error</h2>
        <p>${message}</p>
        <button id="retry-btn">Retry</button>
      </div>';
      
      document.getElementById('retry-btn').addEventListener('click', () => {
        window.electronAPI.restartApp();
      });
    `);
  }
}

// Handle app events
app.on('ready', async () => {
    // Set up all API handlers
    log.info('Electron API initialization');
    setupApiHandlers();
    createWindow();

    const flaskReady = await waitForFlaskReady();
    if (flaskReady) {
        log.info('Flask server is ready, loading main application...');
        loadMainApp();
    } else {
        showError('Failed to connect to backend server. Please restart the application.');
    }
});

app.on('window-all-closed', () => {
  log.info('All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  log.info('Application will quit');
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
