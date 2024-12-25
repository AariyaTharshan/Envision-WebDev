const { app, BrowserWindow } = require('electron');
const path = require('path');

function createMainWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
        },
        autoHideMenuBar: true,
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
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});
