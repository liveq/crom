#!/bin/bash

# Copy all image assets from public to dist
echo "Copying image assets from public to dist..."

# Create dist directory if it doesn't exist
mkdir -p dist

# Copy all image directories
cp -r public/images dist/ 2>/dev/null || echo "images directory not found"
cp -r public/attraction-images dist/ 2>/dev/null || echo "attraction-images directory not found"
cp -r public/street-images dist/ 2>/dev/null || echo "street-images directory not found"
cp -r public/food-images dist/ 2>/dev/null || echo "food-images directory not found"
cp -r public/construction-images dist/ 2>/dev/null || echo "construction-images directory not found"
cp -r public/street-assets dist/ 2>/dev/null || echo "street-assets directory not found"

# Copy other public assets
cp public/favicon.svg dist/ 2>/dev/null || echo "favicon not found"
cp public/404.html dist/ 2>/dev/null || echo "404.html not found"

echo "Asset copy complete!"
ls -la dist/ | grep -E "(images|attraction|street|food|construction)"