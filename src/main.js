const { app, BrowserWindow } = require('electron');
const path = require('path');
const http = require('http');

let mainWindow = null;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkServer() {
    return new Promise((resolve) => {
        http.get('http://127.0.0.1:5000/verify', (res) => {
            resolve(res.statusCode === 200);
        }).on('error', () => {
            resolve(false);
        });
    });
}

async function waitForFlask() {
    console.log(`Waiting for Flask server to start...`);

    let attempts = 0;
    const maxAttempts = 40;

    while (attempts < maxAttempts) {
        console.log(`Attempt ${attempts + 1}...`);
        const isRunning = await checkServer();
        if (isRunning) return true;
        await sleep(5000); // Wait 5 seconds
        attempts++;
    }

    return false;
}

// Create the main application window
const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 600,
        height: 400,
        center: true,
        resizable: false,
        titleBarStyle: 'hidden',
        ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.loadFile('src/loading.html');
};

// Load the actual app after Flask is ready
const loadMainApp = () => {
    if (!mainWindow) return;

    mainWindow.setSize(1000, 700);
    mainWindow.center();              // Re-center after resize
    mainWindow.setResizable(true);    // Enable resizing after full load
    mainWindow.loadFile('src/index.html');
};

app.whenReady().then(async () => {
    createWindow();

    const flaskReady = await waitForFlask();

    if (flaskReady) {
        loadMainApp();
    } else {
        mainWindow.webContents.executeJavaScript(`
            document.body.classList.add('dragable');
            document.body.innerHTML = '<p class="loading-page-text" style="margin-top:27px">Loading failed</p>';
        `);
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
