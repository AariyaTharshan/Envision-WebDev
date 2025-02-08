const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
let pythonProcess = null;

function startFlaskServer() {
    // Path to your Python executable and script
    const pythonPath = 'python'; // or 'python3' depending on your system
    const scriptPath = path.join(__dirname, '..', 'backend', 'camera_server.py');

    // Start Flask server
    pythonProcess = spawn(pythonPath, [scriptPath]);

    pythonProcess.stdout.on('data', (data) => {
        console.log(`Flask server: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Flask server error: ${data}`);
    });

    // Wait for Flask to start
    return new Promise((resolve) => {
        setTimeout(resolve, 2000); // Give Flask 2 seconds to start
    });
}

async function createMainWindow() {
    // Start Flask server before creating window
    await startFlaskServer();

    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, 'preload.js')
        },
        autoHideMenuBar: true,
    });

    // Set zoom level to 80% (0.8)
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.setZoomFactor(0.85);
    });

    // Load the production build
    const htmlPath = path.join(__dirname, '../dist/index.html');
    console.log('Loading:', htmlPath);

    mainWindow.loadFile(htmlPath).catch((err) => {
        console.error('Error loading index.html:', err);
    });
}

app.on('ready', createMainWindow);

app.on('window-all-closed', () => {
    if (pythonProcess) {
        pythonProcess.kill();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});

// Kill Flask server when app quits
app.on('before-quit', () => {
    if (pythonProcess) {
        pythonProcess.kill();
    }
});

// Add IPC handler for folder picker
ipcMain.handle('dialog:openFolder', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    
    if (!result.canceled) {
        return result.filePaths[0];
    }
    return null;
});
