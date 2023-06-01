"use strict";

let state = { isInferenceRunning: false };

function getState() {
    return state;
}

function setState(newState) {
    state = { ...state, ...newState };
}

module.exports = { getState, setState };
