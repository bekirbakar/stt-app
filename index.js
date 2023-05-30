"use strict";

// This script initializes and controls the main window of the Electron app
// and handles the lifecycle events of the application.

const path = require("path");
const { app, ipcMain, dialog, BrowserWindow, globalShortcut } = require("electron");

// Import and configure the module for live-reloading the app during development.
const electronReload = require("electron-reload");
electronReload(__dirname, { electron: path.join(__dirname, "node_modules", ".bin", "electron") });

let mainWindow = null;

// Initialize the app.
function initialize() {
    // Window options for main window.
    let windowOptions = {
        backgroundColor: "#808080",
        title: "Placeholder",
        width: 800,
        height: 600,
        resizable: false,
        show: false,
        webPreferences: {
            zoomFactor: 1,
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            contextIsolation: false,
            preload: path.resolve(__dirname, "preload.js"),
            webSecurity: true,
            minimumFontSize: 10,
            defaultFontSize: 18,
            defaultMonospaceFontSize: 20,
            enableRemoteModule: true
        },
        acceptFirstMouse: true,
        frame: true,
        transparent: false,
        titleBarStyle: "default",
        maximizable: false
    };

    mainWindow = new BrowserWindow(windowOptions);

    // TODO: Hide menu bar!!!
    mainWindow.setMenuBarVisibility(false);

    mainWindow.loadFile(path.resolve(__dirname, "browser/index.html")).then();

    mainWindow.once("ready-to-show", () => { mainWindow.show(); });

    mainWindow.on("close", () => { mainWindow = null; });

    mainWindow.on("closed", () => {
        globalShortcut.unregisterAll();
        app.quit();
    });

    mainWindow.onbeforeunload = (event) => { event.returnValue = false; };
}

// Initialize the app when Electron is ready.
app.whenReady().then(() => {
    try {
        app.allowRendererProcessReuse = false;
        initialize();
    } catch (error) {
        throw new Error(`Initialization failed: ${error.toString()}`);
    }
});

app.on("window-all-closed", () => { app.quit(); });

app.on("before-quit", () => { });

app.on("will-quit", () => { });

// Handle the lifecycle events of the app.
ipcMain.on('no-file-selected-dialog', async (_, message) => {
    await dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
        type: 'info',
        title: 'Information',
        message: message,
    })
})

ipcMain.on('unsupported-file-dialog', async (_, message) => {
    await dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
        type: 'info',
        title: 'Information',
        message: message,
    })
})

ipcMain.on('no-changes-dialog', async (_, message) => {
    await dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
        type: 'info',
        title: 'Information',
        message: message,
    })
})
