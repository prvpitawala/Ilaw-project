const { app, BrowserWindow } = require('electron');
const path = require('path');
const http = require('http');


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkServer() {
    return new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:5000/verify', (res) => {
            if (res.statusCode === 200) {
                console.log("Flask server verified!");
                resolve(true);
            } else {
                console.log("Server responded but not OK.");
                resolve(false);
            }
        }).on('error', () => {
            console.log("Failed to connect to Flask server.");
            resolve(false);
        });
    });
}

async function startFlask() {
    console.log(`Checking Flask server startup...`);
    
    let attempts = 0;
    let maxAttempts = 40;

    while (attempts < maxAttempts) {
        console.log(`Attempt ${attempts + 1}...`);
        const isRunning = await checkServer();
        if (isRunning) break; // ✅ Stop checking if server is running
        await sleep(5000); // Wait 5 seconds before retrying
        attempts++;
    }

    if (attempts === maxAttempts) {
        console.error("Failed to verify Flask server after multiple attempts.");
    }
}


function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        titleBarStyle: 'hidden',
        // frame: true,
        ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.loadFile('src/index.html');
}

app.whenReady().then(async () => {
    try {
        await startFlask();
        console.log("Flask started successfully!");
    } catch (error) {
        console.error("Failed to start Flask:", error);
        app.quit();
        return;
    }
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
