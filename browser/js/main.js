"use strict";

const fs = require("fs");
const { shell, ipcRenderer } = require("electron");

const utilities = require("./js/utilities.js");
const inference = require("./js/inference.js");
const { languageData } = require("./js/ui.js");

const configuration = utilities.getConfiguration();

let li = configuration.settings.languages.selected;

// Main Content
window.onload = function () {
    fetch(utilities.configurationFilePath)
        .then((response) => response.json())
        .then((configuration) => {
            // General Configuration
            document.getElementById("sidebar").className = "";
            document.getElementById("sidebar-toggle-icon").innerText = "⬅";
            document.getElementById('settings-button').textContent = languageData[li].sidebarSettingsButton;
            document.getElementById('about-button').textContent = languageData[li].sidebarAboutButton;
            document.getElementById('asr-engine-selector-label').textContent = languageData[li].asrEngineSelectorLabel;
            document.getElementById('asr-model-selector-label').textContent = languageData[li].asrModelSelectorLabel;
            document.getElementById('uploaded-file-label').textContent = languageData[li].uploadedFileLabel;
            document.getElementById('configuration-button').textContent = languageData[li].configurationButton;
            document.getElementById('start-button').textContent = languageData[li].startButton;
            document.getElementById('clear-button').textContent = languageData[li].clearButton;
            document.getElementById('copy-button').textContent = languageData[li].copyButton;
            document.getElementById('settings-title').textContent = languageData[li].settingsTitle;
            document.getElementById('configuration-title').textContent = languageData[li].configurationTitle;
            document.getElementById('language-label').textContent = languageData[li].languageLabel;
            document.getElementById('settings-save-button').textContent = languageData[li].settingsSaveButton;
            document.getElementById('settings-exit-button').textContent = languageData[li].exitButton;
            document.getElementById('configuration-save-button').textContent = languageData[li].configurationSaveButton;
            document.getElementById('configuration-exit-button').textContent = languageData[li].exitButton;

            // Language Selector
            const languageSelector = document.getElementById("language-selector");
            configuration.settings.languages.supported.forEach((language) => {
                const option = document.createElement("option");
                option.value = language.id;
                option.text = language.name;
                languageSelector.appendChild(option);
            });

            // Engine and Model Selectors
            const engineSelector = document.getElementById("engine");
            configuration.engines.forEach((engine) => {
                const option = document.createElement("option");
                option.value = engine.id;
                option.text = engine.name;
                engineSelector.appendChild(option);
            });

            engineSelector.addEventListener("change", function () {
                const selectedEngine = configuration.engines.find((engine) => engine.id === this.value);
                const modelSelector = document.getElementById("model");

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
        })
        .catch((error) => console.error(error));
};

// Sidebar
document.getElementById("sidebar-toggle-button").addEventListener("click", function () {
    if (sidebar.className === "collapsed") {
        sidebar.className = "";

        document.getElementById("main-content").className = "";
        this.innerText = "⬅";
    } else {
        sidebar.className = "collapsed";
        document.getElementById("main-content").className = "collapsed";
        this.innerText = "➡";
    }
});

// Settings
document.getElementById("settings-button").addEventListener("click", function () {
    document.getElementById("language-selector").value = li;
    document.getElementById("settings-dialog").showModal();
});

document.getElementById("settings-save-button").addEventListener("click", function () {
    const selectedLanguage = document.getElementById("language-selector").value;
    configuration.settings.languages.selected = selectedLanguage;
    document.getElementById("language-selector").value = selectedLanguage;
    document.getElementById("settings-dialog").close();

    utilities.updateConfiguration(configuration);
});

// About
document.getElementById("about-button").addEventListener("click", function () {
    shell.openExternal(configuration.aboutUrl);
});

const SELECTED_COLOR = "#cccccc";
const DEFAULT_COLOR = "#ffffff";

let selectedFile = null;

const dropZone = document.getElementById("drop-zone");
const resultBox = document.getElementById("result-box");
const fileInput = document.getElementById("uploaded-file");
const fileLabel = document.querySelector(".uploaded-file-label");

dropZone.addEventListener("dragover", function (e) {
    e.preventDefault();
    utilities.changeBackgroundColor(this, SELECTED_COLOR);
});

dropZone.addEventListener("dragleave", function () {
    utilities.changeBackgroundColor(this, DEFAULT_COLOR);
});

dropZone.addEventListener("drop", function (e) {
    e.preventDefault();
    utilities.changeBackgroundColor(this, DEFAULT_COLOR);
    fileInput.files = e.dataTransfer.files;

    selectedFile = utilities.setFileDetails(fileLabel, e.dataTransfer.files[0], li);
});

fileInput.addEventListener("change", function () {
    utilities.changeBackgroundColor(this, DEFAULT_COLOR);
    selectedFile = utilities.setFileDetails(fileLabel, this.files[0], li);
});

document.getElementById("start-button").addEventListener("click", function () {
    let isInferenceRunning = false;

    if (!isInferenceRunning) {
        if (selectedFile === null) {
            ipcRenderer.send('no-file-selected-dialog', languageData[li].noFileSelected.toString());
        } else if (!configuration.settings.supportedExtensions.includes(selectedFile.name.split(".").pop())) {
            ipcRenderer.send('unsupported-file-dialog', languageData[li].unsupportedFile);
        } else {
            fs.access(selectedFile.path, fs.constants.F_OK, (error) => {
                if (error) {
                    ipcRenderer.send('file-not-found-dialog', languageData[li].fileNotFound);
                } else {
                    isInferenceRunning = true;

                    resultBox.value = "";
                    this.textContent = "Stop";
                    this.style.backgroundColor = "red";

                    inference.inference(configuration.pythonInterpreter, configuration.pythonScript, selectedFile.path)
                        .then((result) => { resultBox.value = result; })
                        .catch((error) => { console.error(error); })
                        .finally(() => {
                            isInferenceRunning = false;
                            this.textContent = "Start";
                            this.style.backgroundColor = "";
                        });
                }
            });
        }
    }
});

document.getElementById("clear-button").addEventListener("click", function () {
    resultBox.value = "";
    fileInput.value = "";
    selectedFile = utilities.setFileDetails(fileLabel, null, li);
});

document.getElementById("copy-button").addEventListener("click", function () {
    resultBox.select();
    document.execCommand("copy");
});

// Configuration
document.getElementById("configuration-button").addEventListener("click", function () {
    const configurationDialog = document.getElementById("configuration-dialog");
    configurationDialog.showModal();
});

document.getElementById("configuration-save-button").addEventListener("click", function () {
    let hasChanges = false;
    let changesToSave = utilities.getConfiguration();

    if (!hasChanges) {
        ipcRenderer.send('no-changes-dialog', languageData[li].noChanges);
    } else {
        utilities.updateConfiguration(changesToSave);
    }
});
