"use strict";

// This script initializes and controls the main window of the Electron app
// and handles the lifecycle events of the application.

const { join, resolve } = require("path");
const { spawn } = require("child_process");
const isDevelopment = require("electron-is-dev");
const { app, ipcMain, dialog, BrowserWindow, globalShortcut, nativeTheme, Menu } = require("electron");

const { processUsageStatistics } = require("./browser/scripts/helpers.js");

let pathToBackendExecutable = null;
if (isDevelopment) {
    require("electron-reload")(__dirname, {
        electron: require(`${__dirname}/node_modules/electron`),
    });

    const electronReload = require("electron-reload");
    electronReload(__dirname, { electron: join(__dirname, "node_modules", ".bin", "electron") });

    pathToBackendExecutable = resolve(__dirname, "packages/fake_text_generator");
} else {
    pathToBackendExecutable = resolve(process.resourcesPath, "app.asar.unpacked", "packages/fake_text_generator");
}

let mainWindow = null;
let currentEvent = null;
let backendProcess = null;
let inferenceStartTime = null;

const isMac = process.platform === "darwin";

const menuBarTemplate = [
    ...(isMac
        ? [
              {
                  label: app.name,
                  submenu: [
                      { role: "about" },
                      { type: "separator" },
                      { role: "services" },
                      { type: "separator" },
                      { role: "hide" },
                      { role: "hideOthers" },
                      { role: "unhide" },
                      { type: "separator" },
                      { role: "quit" },
                      isMac ? { role: "close" } : { role: "quit" },
                  ],
              },
          ]
        : []),
    ...(isDevelopment
        ? [
              {
                  label: "View",
                  submenu: [{ role: "reload" }, { role: "forceReload" }, { role: "toggleDevTools" }],
              },
          ]
        : []),
];

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

    Menu.setApplicationMenu(Menu.buildFromTemplate(menuBarTemplate));

    mainWindow.loadFile(resolve(__dirname, "browser/index.html")).catch((error) => {
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

function initializeBackendProcess() {
    backendProcess = spawn(pathToBackendExecutable);

    backendProcess.stdout.on("data", (data) => {
        processUsageStatistics(backendProcess.pid, inferenceStartTime).then((result) => {
            result.data = data.toString();
            currentEvent.reply("inference-output", JSON.stringify(result));
        });
    });

    backendProcess.stderr.on("data", (data) => {
        console.error(`Backend stderr: ${data}`);
    });

    backendProcess.on("close", (code) => {
        console.log(`Backend close: ${code}`);
        initializeBackendProcess();
    });
}

async function showInfoDialog(message) {
    await dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
        type: "info",
        message: message.info,
    });
}

// Initialize the app when Electron is ready.
app.whenReady().then(() => {
    try {
        app.allowRendererProcessReuse = false;

        app.on("activate", () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                initialize();
                initializeBackendProcess();
            }
        });
    } catch (error) {
        console.error(`Initialization failed: ${error.toString()}`);
        app.quit();
    }
});

app.on("before-quit", () => {
    backendProcess.stdin.pause();
    backendProcess.kill();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

// Handle the lifecycle events of the app.
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

ipcMain.on("inference-input", async (event, message) => {
    if (message.action === "start") {
        inferenceStartTime = Date.now();
        currentEvent = event;
        backendProcess.stdin.write("generate\n");
    } else if (message.action === "stop") {
        backendProcess.stdin.pause();
        backendProcess.kill();
    }
});
