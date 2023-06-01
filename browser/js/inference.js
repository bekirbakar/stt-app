"use strict";

const { spawn } = require("child_process");
const { getState, setState } = require("./state.js");

function runAsrModel(pythonInterpreter, pythonScript, audioFilePath) {
    return new Promise((resolve, reject) => {
        const python = spawn(pythonInterpreter, [pythonScript, audioFilePath]);
        let output = "";
        let error = "";

        python.stdout.on("data", (data) => {
            output += data;
        });

        python.stderr.on("data", (data) => {
            error += data;
        });

        python.on("close", (code) => {
            if (code === 0) {
                resolve(output);
            } else {
                reject(`Exit code: ${code}, Error: ${error}`);
            }
        });

        python.on("error", (err) => {
            reject(err.message);
        });
    });
}

function toggleStartButton(elements, flag) {
    if (flag) {
        elements.startButton.textContent = "Stop";
        elements.startButton.style.backgroundColor = "red";
    } else {
        elements.startButton.textContent = "Start";
        elements.startButton.style.backgroundColor = "";
    }
}

function inference(files, supportedExtensions, elements, pythonInterpreter, pythonScript) {
    return new Promise((resolve, reject) => {
        let selectedFile = null;
        try {
            selectedFile = files[0].path;
        } catch (error) {
            reject({ type: "dialog", action: "no-file-selected" });
        }

        if (!supportedExtensions.includes(selectedFile.split(".").pop())) {
            reject({ type: "dialog", action: "unsupported-file" });
        }

        const state = getState();
        if (!state.isInferenceRunning) {
            setState({ isInferenceRunning: true });

            elements.resultBox.value = "";
            elements.startButton.textContent = "Stop";
            elements.startButton.style.backgroundColor = "red";

            runAsrModel(pythonInterpreter, pythonScript, selectedFile)
                .then((result) => {
                    elements.resultBox.value = result;
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {
                    setState({ isInferenceRunning: false });
                    toggleStartButton(elements, state.isInferenceRunning);
                    resolve();
                });
        } else {
            setState({ isInferenceRunning: false });
            toggleStartButton(elements, state.isInferenceRunning);
        }
    });
}

module.exports = {
    inference,
};
