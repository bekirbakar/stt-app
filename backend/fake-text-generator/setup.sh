#!/bin/bash

set -e

# Declarations
PACKAGE_NAME=fake_text_generator

# Create virtual environment if it does not exist.
if [ ! -d "venv" ]; then
    python -m venv venv
fi

source venv/bin/activate

# Install Dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create Executable
pyinstaller --onefile ${PACKAGE_NAME}.py
