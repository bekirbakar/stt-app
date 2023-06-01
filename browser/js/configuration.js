"use strict";

const { readFileSync, writeFileSync } = require("fs");
const path = require("path");

class Configuration {
    constructor(pathToFile = "../../configuration/configuration.json") {
        this.pathToFile = path.resolve(__dirname, pathToFile);
        this.configuration = {};
        this.load();
    }

    load() {
        try {
            const rawData = readFileSync(this.pathToFile);
            this.configuration = JSON.parse(rawData);
        } catch (error) {
            console.error(`Error reading configuration file: ${error}`);
        }
    }

    save() {
        try {
            const currentData = JSON.stringify(this.configuration, null, 4);
            const existingData = readFileSync(this.pathToFile, "utf8");

            if (JSON.stringify(currentData) === JSON.stringify(existingData)) {
                return false;
            } else {
                writeFileSync(this.pathToFile, currentData);
                return true;
            }
        } catch (error) {
            console.error(`Error writing configuration file: ${error}`);
            return false;
        }
    }

    get(path) {
        return path.split(".").reduce((o, k) => o && o[k], this.configuration);
    }

    set(path, value) {
        const keys = path.split(".");
        const lastKey = keys.pop();
        const target = keys.reduce((o, k) => o[k], this.configuration);

        if (target && lastKey) {
            target[lastKey] = value;
        } else {
            console.error(`Invalid path: ${path}`);
        }
    }

    toggle(key) {
        this.configuration[key] = !this.configuration[key];
    }
}

module.exports = { Configuration };
