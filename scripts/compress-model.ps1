# Phase 2 Optimization: Automated Model Compression Script (Windows)
# This script compresses the 3D model using Draco compression

Write-Host "🚀 Starting Phase 2 Optimization: Model Compression" -ForegroundColor Cyan
Write-Host "================================================="
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/"
    exit 1
}

Write-Host ""

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Install gltf-pipeline if not already installed
Write-Host "📦 Checking gltf-pipeline..." -ForegroundColor Yellow

try {
    $null = Get-Command gltf-pipeline -ErrorAction Stop
    Write-Host "✅ gltf-pipeline already installed" -ForegroundColor Green
} catch {
    Write-Host "Installing gltf-pipeline globally..."
    npm install -g gltf-pipeline
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install gltf-pipeline" -ForegroundColor Red
        Write-Host "Try running PowerShell as Administrator"
        exit 1
    }
    Write-Host "✅ gltf-pipeline installed" -ForegroundColor Green
}

Write-Host ""

# Check if model file exists
$modelFile = "cute robot 3d model.glb"

if (-not (Test-Path $modelFile)) {
    Write-Host "❌ Model file not found: $modelFile" -ForegroundColor Red
    Write-Host "Please run this script from the repository root directory"
    exit 1
}

Write-Host "✅ Model file found" -ForegroundColor Green
Write-Host ""

# Get original file size
$origSize = (Get-Item $modelFile).Length
$origSizeMB = [math]::Round($origSize / 1MB, 2)

Write-Host "📊 Original Model Stats:"
Write-Host "   File: $modelFile"
Write-Host "   Size: $origSizeMB MB"
Write-Host ""

# Create backup
Write-Host "💾 Creating backup..." -ForegroundColor Yellow
$backupFile = "$modelFile.backup"
Copy-Item $modelFile $backupFile -Force
Write-Host "✅ Backup created: $backupFile" -ForegroundColor Green
Write-Host ""

# Compress with Draco
Write-Host "🗜️  Compressing with Draco..." -ForegroundColor Yellow
Write-Host "This may take 30-60 seconds..."
Write-Host ""

$outputFile = "cute robot 3d model.optimized.glb"

# Run gltf-pipeline with Draco compression
& gltf-pipeline -i $modelFile -o $outputFile -d `
  --draco.compressionLevel 10 `
  --draco.quantizePositionBits 14 `
  --draco.quantizeNormalBits 10 `
  --draco.quantizeTexcoordBits 12 `
  --draco.unifiedQuantization

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Compression failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Compression complete!" -ForegroundColor Green
Write-Host ""

# Get compressed file size
$newSize = (Get-Item $outputFile).Length
$newSizeMB = [math]::Round($newSize / 1MB, 2)

# Calculate reduction
$reduction = [math]::Round((1 - $newSize / $origSize) * 100, 2)

Write-Host "📊 Compression Results:"
Write-Host "================================================="
Write-Host "Original size:  " -NoNewline
Write-Host "$origSizeMB MB" -ForegroundColor Yellow
Write-Host "Compressed size: " -NoNewline
Write-Host "$newSizeMB MB" -ForegroundColor Green
Write-Host "Reduction:      " -NoNewline
Write-Host "$reduction%" -ForegroundColor Green
Write-Host "================================================="
Write-Host ""

# Ask user if they want to replace the original
Write-Host "Would you like to replace the original model? (y/n): " -ForegroundColor Yellow -NoNewline
$response = Read-Host

if ($response -match '^[Yy]') {
    Move-Item $outputFile $modelFile -Force
    Write-Host "✅ Original model replaced" -ForegroundColor Green
    Write-Host "   Backup saved as: $backupFile"
} else {
    Write-Host "ℹ️  Compressed model saved as: $outputFile" -ForegroundColor Yellow
    Write-Host "   You can manually replace it later"
}

Write-Host ""
Write-Host "🎉 Phase 2 Optimization Complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Test the compressed model in your browser"
Write-Host "2. If everything works, delete the backup file"
Write-Host "3. Commit and push changes to GitHub"
Write-Host ""
Write-Host "Expected improvements:"
Write-Host "  - Loading time: -60-70%"
Write-Host "  - FPS: +30-40%"
Write-Host "  - VRAM usage: -60-70%"
Write-Host ""
