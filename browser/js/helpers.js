"use strict";

const { SELECTED_COLOR, DEFAULT_COLOR } = require("./constants.js");

function getElementById(id) {
    return document.getElementById(id);
}

function toggleClassValue(elementId, className) {
    const element = getElementById(elementId);
    element.classList.toggle(className);
}

function toggleFileUploadAreaBackgroundColor(element) {
    if (!(element instanceof Element)) {
        console.error(`Invalid element: expected instance of Element, got ${typeof element}`);
        return;
    }

    element.style.backgroundColor = element.style.backgroundColor === SELECTED_COLOR ? DEFAULT_COLOR : SELECTED_COLOR;
}

function truncateFilename(filename, maxLength = 75) {
    if (typeof filename !== "string") {
        console.error(`Invalid filename: expected string, got ${typeof filename}`);
        return "";
    }

    if (filename.length <= maxLength) {
        return filename;
    } else {
        return "..." + filename.slice(-(maxLength - 3));
    }
}

function stringToCamelCase(str) {
    return str
        .split("-")
        .map((word, index) => {
            if (index == 0) {
                return word.toLowerCase();
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join("");
}

module.exports = {
    getElementById,
    toggleClassValue,
    toggleFileUploadAreaBackgroundColor,
    truncateFilename,
    stringToCamelCase,
};
