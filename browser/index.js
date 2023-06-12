"use strict";

const { shell, ipcRenderer } = require("electron");
const { Localizer } = require("./scripts/localization.js");
const { getState, setState } = require("./scripts/state.js");
const { ConfigurationManager } = require("./scripts/configuration-manager.js");
const { getElementById, toggleClassValue, truncateFilename } = require("./scripts/helpers.js");

const backendArgumentsManager = new ConfigurationManager();
const configurationManager = new ConfigurationManager("../../configuration/configuration.json");

const localizer = new Localizer(configurationManager.get("settings.languages.selected"));

const sidebar = getElementById("sidebar");
const settingsDialog = getElementById("settings-dialog");
const languageSelector = getElementById("language-selector");
const sidebarToggleButton = getElementById("sidebar-toggle-button");

const dropZone = getElementById("drop-zone");
const resultBox = getElementById("result-box");
const fileInput = getElementById("uploaded-file");
const startButton = getElementById("start-button");
const uploadedFileLabel = document.querySelector(".uploaded-file-label");

function setMainLanguageDependentText() {
    localizer.updateUIText("settings-button");
    localizer.updateUIText("about-button");
    localizer.updateUIText("asr-engine-selector-label");
    localizer.updateUIText("asr-model-selector-label");
    localizer.updateUIText("uploaded-file-label");
    localizer.updateUIText("configuration-button");
    localizer.updateUIText("start-button");
    localizer.updateUIText("clear-button");
    localizer.updateUIText("copy-button");
    localizer.updateUIText("dark-mode-label");
    localizer.updateUIText("language-label");
    localizer.updateUIText("settings-save-button");
    localizer.updateUIText("settings-exit-button");
    localizer.updateUIText("configuration-save-button");
    localizer.updateUIText("configuration-exit-button");
}

function initializeSidebar() {
    sidebar.className = "";
    sidebarToggleButton.textContent = "⬅";
}

function handleSidebarToggle() {
    toggleClassValue("sidebar", "collapsed");
    toggleClassValue("main-content", "collapsed");
    this.textContent = sidebar.classList.contains("collapsed") ? "➡" : "⬅";
}

function initializeLanguageSelector() {
    configurationManager.get("settings.languages.supported").forEach((language) => {
        const option = document.createElement("option");
        option.value = language.id;
        option.text = language.name;
        languageSelector.appendChild(option);
    });
}

function initializeEngineSelector() {
    const engineSelector = getElementById("engine");

    configurationManager.get("engines").forEach((engine) => {
        const option = document.createElement("option");
        option.value = engine.id;
        option.text = engine.name;
        engineSelector.appendChild(option);
    });

    engineSelector.addEventListener("change", function () {
        const selectedEngine = configurationManager.get("engines").find((engine) => engine.id === this.value);
        const modelSelector = getElementById("model");

        modelSelector.innerHTML = "";

        if (selectedEngine.models) {
            selectedEngine.models.forEach((model) => {
                const option = document.createElement("option");
                option.value = model;
                option.text = model;
                modelSelector.appendChild(option);
            });
        }
    });

    engineSelector.dispatchEvent(new Event("change"));
}

function startInference() {
    setState({ isInferenceRunning: true });

    resultBox.value = "";
    startButton.textContent = localizer.localize("stop-button");
    startButton.style.backgroundColor = "red";

    ipcRenderer.send("inference-input", {
        action: "start",
        backendArgumentsManager: backendArgumentsManager.configuration,
    });
}

function stopInference() {
    setState({ isInferenceRunning: false });

    startButton.textContent = localizer.localize("start-button");
    startButton.style.backgroundColor = "";

    ipcRenderer.send("inference-input", {
        action: "stop",
        backendArgumentsManager: backendArgumentsManager.configuration,
    });
}

function getUploadAreaColor() {
    const DEFAULT_COLOR_BG_DARK = "#0A5A0A";
    const DEFAULT_COLOR_BG_LIGHT = "#F0F0F0";

    const FILE_UPLOADED_BG_DARK = "#197019";
    const FILE_UPLOADED_BG_LIGHT = "#E3E3E3";

    const darkModeEnabled = configurationManager.get("settings.darkModeEnabled");

    return {
        FILE_UPLOADED_BG: darkModeEnabled === true ? FILE_UPLOADED_BG_DARK : FILE_UPLOADED_BG_LIGHT,
        FILE_UPLOADED_BG_DEFAULT: darkModeEnabled === true ? DEFAULT_COLOR_BG_DARK : DEFAULT_COLOR_BG_LIGHT,
    };
}

// Main Content
window.onload = function () {
    initializeSidebar();
    setMainLanguageDependentText();

    initializeLanguageSelector();
    initializeEngineSelector();

    ipcRenderer.send("dialog", {
        action: "dark-mode",
        isEnabled: configurationManager.get("settings.darkModeEnabled"),
    });
};

// Sidebar
sidebarToggleButton.addEventListener("click", handleSidebarToggle);

// Settings
getElementById("settings-button").addEventListener("click", function () {
    getElementById("dark-mode-enabled").checked = configurationManager.get("settings.darkModeEnabled");
    languageSelector.value = configurationManager.get("settings.languages.selected");

    settingsDialog.showModal();
});

getElementById("settings-save-button").addEventListener("click", function () {
    const settingsFields = {
        "settings.languages.selected": {
            domElement: "language-selector",
            getDomValue: (el) => el.value,
            onChange: (newLanguage) => {
                localizer.setLanguage(newLanguage);
                setMainLanguageDependentText();
            },
        },
        "settings.darkModeEnabled": {
            domElement: "dark-mode-enabled",
            getDomValue: (el) => el.checked,
            onChange: (newDarkModeEnabled) => {
                ipcRenderer.send("dialog", { action: "dark-mode", isEnabled: newDarkModeEnabled });
                uploadedFileLabel.style.backgroundColor = getUploadAreaColor().FILE_UPLOADED_BG_DEFAULT;
                dropZone.style.backgroundColor = getUploadAreaColor().FILE_UPLOADED_BG_DEFAULT;
            },
        },
    };

    let hasChanges = false;

    for (const setting in settingsFields) {
        const field = settingsFields[setting];
        const newSettingValue = field.getDomValue(getElementById(field.domElement));

        if (newSettingValue !== configurationManager.get(setting)) {
            configurationManager.set(setting, newSettingValue);
            field.onChange(newSettingValue);
            hasChanges = true;
        }
    }

    if (hasChanges) {
        configurationManager.save();
    } else {
        ipcRenderer.send("dialog", { action: "no-changes", info: localizer.localizeDialog("noChanges") });
    }

    settingsDialog.close();
});

// About
getElementById("about-button").addEventListener("click", function () {
    shell.openExternal(configurationManager.get("aboutUrl"));
});

// Inference
dropZone.addEventListener("dragover", function (e) {
    this.style.backgroundColor = getUploadAreaColor().FILE_UPLOADED_BG;
    uploadedFileLabel.style.backgroundColor = getUploadAreaColor().FILE_UPLOADED_BG;
    e.preventDefault();
});

dropZone.addEventListener("dragleave", function () {
    this.style.backgroundColor = getUploadAreaColor().FILE_UPLOADED_BG_DEFAULT;
    uploadedFileLabel.style.backgroundColor = getUploadAreaColor().FILE_UPLOADED_BG_DEFAULT;
});

dropZone.addEventListener("drop", function (e) {
    e.preventDefault();
    this.style.backgroundColor = getUploadAreaColor().FILE_UPLOADED_BG_DEFAULT;
    uploadedFileLabel.style.backgroundColor = getUploadAreaColor().FILE_UPLOADED_BG_DEFAULT;

    fileInput.files = e.dataTransfer.files;
    uploadedFileLabel.textContent = truncateFilename(e.dataTransfer.files[0].path);
});

fileInput.addEventListener("change", function () {
    dropZone.style.backgroundColor = getUploadAreaColor().FILE_UPLOADED_BG;
    uploadedFileLabel.style.backgroundColor = getUploadAreaColor().FILE_UPLOADED_BG;

    uploadedFileLabel.textContent = truncateFilename(this.files[0].path);
});

startButton.addEventListener("click", function () {
    backendArgumentsManager.set("engine", getElementById("engine").value);
    backendArgumentsManager.set("modelType", getElementById("model").value);

    backendArgumentsManager.set("modelPath", "");
    backendArgumentsManager.set("device", "cpu");
    backendArgumentsManager.set("computeType", "int8");

    backendArgumentsManager.set("pathToPythonScript", configurationManager.get("pythonScript"));
    backendArgumentsManager.set("pathToPythonInterpreter", configurationManager.get("pythonInterpreter"));

    try {
        backendArgumentsManager.set("pathToAudioFile", fileInput.files[0].path);
    } catch (error) {
        ipcRenderer.send("dialog", { action: "no-file-selected", info: localizer.localizeDialog("noFileSelected") });
        return;
    }

    const extension = backendArgumentsManager.configuration.pathToAudioFile.split(".").pop();
    if (!configurationManager.get("settings.supportedExtensions").includes(extension)) {
        ipcRenderer.send("dialog", { action: "unsupported-file", info: localizer.localizeDialog("unsupportedFile") });
        return;
    }

    let state = getState();

    if (!state.isInferenceRunning) {
        startInference();
    } else {
        stopInference();
    }
});

ipcRenderer.on("inference-output", (_, result) => {
    setState({ isInferenceRunning: false });
    startButton.textContent = "Start";
    startButton.style.backgroundColor = "";

    const parsedResult = JSON.parse(result);

    resultBox.value =
        `Elapsed Time: ${parsedResult.elapsedTime}\n` +
        `Memory Usage: ${parsedResult.memoryUsage}\n` +
        `CPU Usage: ${parsedResult.cpuUsage}\n\n` +
        `Transcription: ${parsedResult.data}`;
});

getElementById("clear-button").addEventListener("click", function () {
    resultBox.value = "";
    fileInput.value = "";
    uploadedFileLabel.textContent = localizer.localize("uploaded-file-label");
    dropZone.style.backgroundColor = getUploadAreaColor().FILE_UPLOADED_BG_DEFAULT;
    uploadedFileLabel.style.backgroundColor = getUploadAreaColor().FILE_UPLOADED_BG_DEFAULT;
});

getElementById("copy-button").addEventListener("click", function () {
    resultBox.select();
    document.execCommand("copy");
});

// Configuration Button
getElementById("configuration-button").addEventListener("click", function () {
    const configurationDialog = getElementById("configuration-dialog");
    configurationDialog.showModal();
});

getElementById("configuration-save-button").addEventListener("click", function () {
    ipcRenderer.send("dialog", { action: "no-changes", info: localizer.localizeDialog("noChanges") });
});
