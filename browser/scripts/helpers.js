"use strict";

const pidusage = require("pidusage");

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

function processUsageStatistics(processId, startTime) {
    return new Promise((resolve, reject) => {
        pidusage(processId, function (error, statistics) {
            if (error) {
                return reject(error);
            }
            // Elapsed time since the process was spawned in minutes.
            const elapsedTime = `${((Date.now() - startTime) / (1000 * 60)).toFixed(1)} Minutes`;

            // Memory usage in mega bytes.
            const memoryUsage = `${(statistics.memory / 1024 / 1024).toFixed(1)} MB`;

            // CPU usage in percentage.
            const cpuUsage = `${statistics.cpu.toFixed(1)}%`;

            resolve({
                elapsedTime: elapsedTime,
                memoryUsage: memoryUsage,
                cpuUsage: cpuUsage,
            });
        });
    });
}

module.exports = {
    getElementById,
    toggleClassValue,
    truncateFilename,
    stringToCamelCase,
    processUsageStatistics,
};
