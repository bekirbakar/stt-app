"use strict";

const { shell, ipcRenderer } = require("electron");

const { runAsrModel } = require("./js/inference.js");
const { getState, setState } = require("./js/state.js");

const { Localizer } = require("./js/localization.js");
const { Configuration } = require("./js/configuration.js");
const {
    getElementById,
    toggleClassValue,
    toggleFileUploadAreaBackgroundColor,
    truncateFilename,
} = require("./js/helpers.js");

const configuration = new Configuration("../../configuration/configuration.json");
const backendConfiguration = new Configuration();

const localizer = new Localizer(configuration.get("settings.languages.selected"));

const settingsDialog = getElementById("settings-dialog");
const languageSelector = getElementById("language-selector");

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
    localizer.updateUIText("configuration-save-button");
    localizer.updateUIText("settings-exit-button");
    localizer.updateUIText("configuration-dave-button");
    localizer.updateUIText("configuration-exit-button");
}

// Main Content
window.onload = function () {
    getElementById("sidebar").className = "";
    getElementById("sidebar-toggle-icon").innerText = "⬅";

    setMainLanguageDependentText();

    ipcRenderer.send("dialog", {
        action: "dark-mode",
        isEnabled: configuration.get("settings.darkModeEnabled"),
    });

    // Sidebar
    getElementById("sidebar-toggle-button").addEventListener("click", function () {
        toggleClassValue("sidebar", "collapsed");
        toggleClassValue("main-content", "collapsed");
        this.innerText = getElementById("sidebar").classList.contains("collapsed") ? "➡" : "⬅";
    });

    // Language
    configuration.get("settings.languages.supported").forEach((language) => {
        const option = document.createElement("option");
        option.value = language.id;
        option.text = language.name;
        languageSelector.appendChild(option);
    });

    // Engine and Model Selectors
    const engineSelector = getElementById("engine");

    configuration.get("engines").forEach((engine) => {
        const option = document.createElement("option");
        option.value = engine.id;
        option.text = engine.name;
        engineSelector.appendChild(option);
    });

    engineSelector.addEventListener("change", function () {
        const selectedEngine = configuration.get("engines").find((engine) => engine.id === this.value);
        const modelSelector = getElementById("model");

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
};

// Settings
getElementById("settings-button").addEventListener("click", function () {
    getElementById("dark-mode-enabled").checked = configuration.get("settings.darkModeEnabled");
    languageSelector.value = configuration.get("settings.languages.selected");

    settingsDialog.showModal();
});

getElementById("settings-save-button").addEventListener("click", function () {
    let hasChanges = false;
    if (getElementById("language-selector").value !== configuration.get("settings.languages.selected")) {
        hasChanges = true;
        localizer.setLanguage(getElementById("language-selector").value);
        configuration.set("settings.languages.selected", getElementById("language-selector").value);

        setMainLanguageDependentText();
    }

    if (getElementById("dark-mode-enabled").checked !== configuration.get("settings.darkModeEnabled")) {
        hasChanges = true;
        configuration.set("settings.darkModeEnabled", getElementById("dark-mode-enabled").checked);
        ipcRenderer.send("dialog", {
            action: "dark-mode",
            isEnabled: getElementById("dark-mode-enabled").checked,
        });
    }

    if (!hasChanges) {
        ipcRenderer.send("dialog", { action: "no-changes", info: localizer.localizeDialog("noChanges") });
    } else {
        configuration.save();
    }

    settingsDialog.close();
});

// About
getElementById("about-button").addEventListener("click", function () {
    shell.openExternal(configuration.get("aboutUrl"));
});

// Inference
const dropZone = getElementById("drop-zone");
const resultBox = getElementById("result-box");
const fileInput = getElementById("uploaded-file");
const startButton = getElementById("start-button");
const uploadedFileLabel = document.querySelector(".uploaded-file-label");

dropZone.addEventListener("dragover", function (e) {
    e.preventDefault();
    toggleFileUploadAreaBackgroundColor(this);
});

dropZone.addEventListener("dragleave", function () {
    toggleFileUploadAreaBackgroundColor(this);
});

dropZone.addEventListener("drop", function (e) {
    e.preventDefault();
    toggleFileUploadAreaBackgroundColor(this);
    fileInput.files = e.dataTransfer.files;
    uploadedFileLabel.textContent = truncateFilename(e.dataTransfer.files[0].path);
});

fileInput.addEventListener("change", function () {
    toggleFileUploadAreaBackgroundColor(this);
    uploadedFileLabel.textContent = truncateFilename(this.files[0].path);
});

startButton.addEventListener("click", function () {
    backendConfiguration.set("engine", getElementById("engine").value);
    backendConfiguration.set("modelType", getElementById("model").value);

    backendConfiguration.set("modelPath", "");
    backendConfiguration.set("device", "cpu");
    backendConfiguration.set("computeType", "int8");

    backendConfiguration.set("pathToPythonScript", configuration.get("pythonScript"));
    backendConfiguration.set("pathToPythonInterpreter", configuration.get("pythonInterpreter"));
    backendConfiguration.set("supportedExtensions", configuration.get("settings.supportedExtensions"));

    try {
        backendConfiguration.set("pathToAudioFile", fileInput.files[0].path);
    } catch (error) {
        ipcRenderer.send("dialog", { action: "no-file-selected", info: localizer.localizeDialog("noFileSelected") });
        return;
    }

    if (
        !backendConfiguration.configuration.supportedExtensions.includes(
            backendConfiguration.configuration.pathToAudioFile.split(".").pop()
        )
    ) {
        ipcRenderer.send("dialog", { action: "unsupported-file", info: localizer.localizeDialog("unsupportedFile") });
        return;
    }
    const state = getState();
    if (!state.isInferenceRunning) {
        setState({ isInferenceRunning: true });

        resultBox.value = "";
        startButton.textContent = "Stop";
        startButton.style.backgroundColor = "red";

        runAsrModel(backendConfiguration.configuration)
            .then((result) => {
                resultBox.value = result;
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setState({ isInferenceRunning: false });
                startButton.textContent = "Start";
                startButton.style.backgroundColor = "";
            });
    } else {
        setState({ isInferenceRunning: false });
        startButton.textContent = "Start";
        startButton.style.backgroundColor = "";
    }
});

getElementById("clear-button").addEventListener("click", function () {
    resultBox.value = "";
    fileInput.value = "";
    uploadedFileLabel.textContent = localizer.localize("uploaded-file-label");
});

getElementById("copy-button").addEventListener("click", function () {
    resultBox.select();
    document.execCommand("copy");
});

// Configuration
getElementById("configuration-button").addEventListener("click", function () {
    const configurationDialog = getElementById("configuration-dialog");
    configurationDialog.showModal();
});

getElementById("configuration-save-button").addEventListener("click", function () {
    ipcRenderer.send("dialog", { action: "no-changes", info: localizer.localizeDialog("noChanges") });
});
