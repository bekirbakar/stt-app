"use strict";

function getElementById(id) {
    return document.getElementById(id);
}

function toggleClassValue(elementId, className) {
    const element = getElementById(elementId);
    element.classList.toggle(className);
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
    truncateFilename,
    stringToCamelCase,
};
