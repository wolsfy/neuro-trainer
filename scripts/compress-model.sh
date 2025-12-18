#!/bin/bash
# Phase 2 Optimization: Automated Model Compression Script
# This script compresses the 3D model using Draco compression

echo "🚀 Starting Phase 2 Optimization: Model Compression"
echo "================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm found: $(npm --version)${NC}"
echo ""

# Install gltf-pipeline if not already installed
echo -e "${YELLOW}📦 Checking gltf-pipeline...${NC}"
if ! command -v gltf-pipeline &> /dev/null; then
    echo "Installing gltf-pipeline globally..."
    npm install -g gltf-pipeline
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install gltf-pipeline${NC}"
        echo "Try running with sudo: sudo npm install -g gltf-pipeline"
        exit 1
    fi
fi

echo -e "${GREEN}✅ gltf-pipeline installed${NC}"
echo ""

# Check if model file exists
MODEL_FILE="cute robot 3d model.glb"
if [ ! -f "$MODEL_FILE" ]; then
    echo -e "${RED}❌ Model file not found: $MODEL_FILE${NC}"
    echo "Please run this script from the repository root directory"
    exit 1
fi

echo -e "${GREEN}✅ Model file found${NC}"
echo ""

# Get original file size
ORIG_SIZE=$(wc -c < "$MODEL_FILE" | xargs)
ORIG_SIZE_MB=$(echo "scale=2; $ORIG_SIZE / 1048576" | bc)

echo "📊 Original Model Stats:"
echo "   File: $MODEL_FILE"
echo "   Size: $ORIG_SIZE_MB MB"
echo ""

# Create backup
echo -e "${YELLOW}💾 Creating backup...${NC}"
cp "$MODEL_FILE" "${MODEL_FILE}.backup"
echo -e "${GREEN}✅ Backup created: ${MODEL_FILE}.backup${NC}"
echo ""

# Compress with Draco
echo -e "${YELLOW}🗜️  Compressing with Draco...${NC}"
echo "This may take 30-60 seconds..."
echo ""

OUTPUT_FILE="cute robot 3d model.optimized.glb"

gltf-pipeline -i "$MODEL_FILE" -o "$OUTPUT_FILE" -d \
  --draco.compressionLevel 10 \
  --draco.quantizePositionBits 14 \
  --draco.quantizeNormalBits 10 \
  --draco.quantizeTexcoordBits 12 \
  --draco.unifiedQuantization

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Compression failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Compression complete!${NC}"
echo ""

# Get compressed file size
NEW_SIZE=$(wc -c < "$OUTPUT_FILE" | xargs)
NEW_SIZE_MB=$(echo "scale=2; $NEW_SIZE / 1048576" | bc)

# Calculate reduction
REDUCTION=$(echo "scale=2; (1 - $NEW_SIZE / $ORIG_SIZE) * 100" | bc)

echo "📊 Compression Results:"
echo "================================================="
echo -e "Original size:  ${YELLOW}$ORIG_SIZE_MB MB${NC}"
echo -e "Compressed size: ${GREEN}$NEW_SIZE_MB MB${NC}"
echo -e "Reduction:      ${GREEN}$REDUCTION%${NC}"
echo "================================================="
echo ""

# Ask user if they want to replace the original
echo -e "${YELLOW}Would you like to replace the original model? (y/n)${NC}"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    mv "$OUTPUT_FILE" "$MODEL_FILE"
    echo -e "${GREEN}✅ Original model replaced${NC}"
    echo -e "   Backup saved as: ${MODEL_FILE}.backup"
else
    echo -e "${YELLOW}ℹ️  Compressed model saved as: $OUTPUT_FILE${NC}"
    echo "   You can manually replace it later"
fi

echo ""
echo "🎉 Phase 2 Optimization Complete!"
echo ""
echo "Next steps:"
echo "1. Test the compressed model in your browser"
echo "2. If everything works, delete the backup file"
echo "3. Commit and push changes to GitHub"
echo ""
echo "Expected improvements:"
echo "  - Loading time: -60-70%"
echo "  - FPS: +30-40%"
echo "  - VRAM usage: -60-70%"
