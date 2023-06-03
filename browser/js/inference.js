"use strict";

const { spawn } = require("child_process");

function runAsrModel(configuration) {
    return new Promise((resolve, reject) => {
        const python = spawn(configuration.pathToPythonInterpreter, [
            configuration.pathToPythonScript,
            JSON.stringify(configuration),
        ]);

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

module.exports = {
    runAsrModel,
};
