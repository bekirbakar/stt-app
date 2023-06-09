#!/bin/bash

source ../venv/bin/activate
pyinstaller --onefile backend.py

mv dist/backend backend

rm -r build dist backend.spec
