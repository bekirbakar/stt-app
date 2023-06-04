"use strict";

// This script initializes and controls the main window of the Electron app
// and handles the lifecycle events of the application.

const path = require("path");
const { app, ipcMain, dialog, BrowserWindow, globalShortcut, nativeTheme } = require("electron");

// Import and configure the module for live-reloading the app during development.
// const electronReload = require("electron-reload");
// electronReload(__dirname, { electron: path.join(__dirname, "node_modules", ".bin", "electron") });

let mainWindow = null;

// Initialize the app.
function initialize() {
    // Window options for main window.
    let windowOptions = {
        width: 800,
        height: 600,
        resizable: false,
        show: false,
        webPreferences: {
            zoomFactor: 1,
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            contextIsolation: false,
            webSecurity: true,
            minimumFontSize: 10,
            defaultFontSize: 18,
            defaultMonospaceFontSize: 20,
            enableRemoteModule: true,
        },
        acceptFirstMouse: true,
        frame: true,
        transparent: false,
        titleBarStyle: "default",
        maximizable: false,
    };

    mainWindow = new BrowserWindow(windowOptions);

    // TODO: Hide menu bar!!!
    mainWindow.setMenuBarVisibility(false);

    mainWindow.loadFile(path.resolve(__dirname, "browser/index.html")).catch((error) => {
        console.error(`Failed to load main window: ${error.toString()}`);
    });

    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
    });

    mainWindow.on("close", () => {
        mainWindow.onbeforeunload = (event) => {
            event.returnValue = false;
        };

        mainWindow = null;
    });

    mainWindow.on("closed", () => {
        globalShortcut.unregisterAll();
        app.quit();
    });
}

// Initialize the app when Electron is ready.
app.whenReady().then(() => {
    try {
        app.allowRendererProcessReuse = false;
        initialize();

        app.on("activate", () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                initialize();
            }
        });
    } catch (error) {
        console.error(`Initialization failed: ${error.toString()}`);
        app.quit();
    }
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

// Handle the lifecycle events of the app.
async function showInfoDialog(message) {
    await dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
        type: "info",
        message: message.info,
    });
}

ipcMain.on("dialog", async (_, message) => {
    if (message.action === "dark-mode") {
        if (message.isEnabled === true) {
            nativeTheme.themeSource = "dark";
        } else {
            nativeTheme.themeSource = "light";
        }
        return nativeTheme.shouldUseDarkColors;
    } else {
        showInfoDialog(message);
    }
});
