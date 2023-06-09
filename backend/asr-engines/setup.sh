#!/bin/bash

set -e

# Declarations
PACKAGE_NAME=asr_engines

# Create virtual environment if it does not exist and activate it.
if [ ! -d "venv" ]; then
    python -m venv venv
fi

source venv/bin/activate

# Install Dependencies
pip install --upgrade pip
pip install -e .

# Run Tests
python -m unittest discover -s tests

# Create Executable
pyinstaller --onefile ${PACKAGE_NAME}.py
