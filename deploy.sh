#!/bin/bash

# Simple deployment script for GitHub Pages
echo "Starting deployment process..."

# Install dependencies
echo "Installing dependencies..."
npm install --no-package-lock

# Build the project
echo "Building the project..."
npm run build

echo "Build completed! The 'out' directory contains your static files."
echo "You can now manually upload these files to GitHub Pages or use the GitHub Actions workflow."
