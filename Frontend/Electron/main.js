const { app, BrowserWindow } = require('electron');
const path = require('path');

function createMainWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
        },
        autoHideMenuBar: true, // Prevents the menu from appearing when Alt is pressed
    });

    // Remove the default menu bar
    mainWindow.setMenu(null);

    // Load your app (development or production)
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html')); // Fixed this line

    // Suppress DevTools console warnings (optional)
    mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
        if (message.includes("Autofill")) {
            event.preventDefault();
        }
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
