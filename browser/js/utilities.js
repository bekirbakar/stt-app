"use strict";

const fs = require("fs");
const { resolve } = require("path");

const configurationFilePath = resolve(__dirname, "../../configuration/configuration.json");

function getConfiguration() {
    try {
        const rawData = fs.readFileSync(configurationFilePath, 'utf8');
        return JSON.parse(rawData);
    } catch (err) {
        console.error(`Error reading configuration file: ${err.message}`);
        return null;
    }
}

function updateConfiguration(data) {
    if (typeof data !== 'object' || data === null) {
        console.error(`Invalid data for configuration: expected object, got ${typeof data}`);
        return;
    }

    try {
        const formattedData = JSON.stringify(data, null, 4);
        fs.writeFileSync(configurationFilePath, formattedData);
    } catch (err) {
        console.error(`Error writing to configuration file: ${err.message}`);
    }
}

function truncateFilename(filename, maxLength = 75) {
    if (typeof filename !== 'string') {
        console.error(`Invalid filename: expected string, got ${typeof filename}`);
        return '';
    }

    if (filename.length <= maxLength) {
        return filename;
    } else {
        return '...' + filename.slice(-(maxLength - 3));
    }
}

function changeBackgroundColor(element, color) {
    element.style.backgroundColor = color;
}

function setFileDetails(element, file, li) {
    if (file) {
        element.textContent = utilities.truncateFilename(file.path);
        selectedFile = file;
    } else {
        element.textContent = languageData[li].uploadedFileLabel;
    }

    return file;
}

module.exports = {
    configurationFilePath,
    getConfiguration,
    updateConfiguration,
    truncateFilename,
    changeBackgroundColor,
    setFileDetails
};
