#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Builds the Millennium Faceit Stats plugin and packages it into a ZIP file.
.DESCRIPTION
    This script performs the following operations:
    1. Builds the plugin using npm run build
    2. Creates a temporary directory for packaging
    3. Copies essential files to the temporary directory
    4. Creates a ZIP archive with the package
    5. Cleans up temporary files
.NOTES
    Version:        1.2
    Author:         Script Generator (with robust install fallback)
    Creation Date:  2025-04-06
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$tempDirName      = "temp_package"
$pluginFolderName = "alowave.faceit_premier_stats"

function Write-Status {
    param([string]$Message)
    Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] $Message" -ForegroundColor Cyan
}
function Write-ErrorMessage {
    param([string]$Message)
    Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] ERROR: $Message" -ForegroundColor Red
}

# Ensure classic node_modules layout
if (-not (Test-Path ".npmrc")) {
    Write-Status "Creating .npmrc with node-linker=node-modules"
    "node-linker=node-modules" | Out-File -FilePath ".npmrc" -Encoding UTF8
}

# Check pnpm
Write-Status "Checking for pnpm..."
if (-not (Get-Command "pnpm" -ErrorAction SilentlyContinue)) {
    try {
        Write-Status "Installing pnpm via npm..."
        npm install -g pnpm
        if ($LASTEXITCODE -ne 0) { throw "pnpm global install failed." }
    } catch {
        Write-ErrorMessage $_.Exception.Message
        exit 1
    }
}

# Install dependencies (pnpm, then npm with flags)
Write-Status "Installing dependencies via pnpm..."
$installSucceeded = $false
try {
    pnpm install
    if ($LASTEXITCODE -eq 0) { $installSucceeded = $true }
    else { throw "pnpm install failed." }
} catch {
    Write-ErrorMessage "pnpm install failed: $($_.Exception.Message)"
}

if (-not $installSucceeded) {
    Write-Status "Falling back to npm install with legacy-peer-deps..."
    try {
        npm install --legacy-peer-deps
        if ($LASTEXITCODE -ne 0) { throw "npm install failed." }
        $installSucceeded = $true
    } catch {
        Write-ErrorMessage "npm install --legacy-peer-deps failed: $($_.Exception.Message)"
        exit 1
    }
}

# Read package.json
if (-not (Test-Path "package.json")) {
    throw "package.json not found."
}
$package = Get-Content package.json -Raw | ConvertFrom-Json
if (-not $package.name -or -not $package.version) {
    throw "package.json must contain name and version."
}
$zipFile = "$($package.name)-$($package.version).zip"

try {
    # Build
    Write-Status "Building plugin..."
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Build failed." }

    # Prepare temp
    Write-Status "Preparing temporary directory..."
    if (Test-Path $tempDirName) { Remove-Item $tempDirName -Recurse -Force }
    New-Item -ItemType Directory -Path $tempDirName | Out-Null
    New-Item -ItemType Directory -Path "$tempDirName/$pluginFolderName" | Out-Null

    # Copy files
    Write-Status "Copying plugin.json..."
    Copy-Item plugin.json "$tempDirName/$pluginFolderName"
    Write-Status "Copying build output..."
    if (-not (Test-Path ".millennium/Dist")) { throw ".millennium/Dist missing." }
    New-Item -ItemType Directory -Path "$tempDirName/$pluginFolderName/.millennium/Dist" -Force | Out-Null
    Copy-Item ".millennium/Dist/*" "$tempDirName/$pluginFolderName/.millennium/Dist" -Recurse

    Write-Status "Copying static and backend..."
    Copy-Item static "$tempDirName/$pluginFolderName" -Recurse
    Copy-Item backend "$tempDirName/$pluginFolderName" -Recurse

    # Zip
    Write-Status "Creating ZIP: $zipFile..."
    if (Test-Path $zipFile) { Remove-Item $zipFile -Force }
    Compress-Archive -Path "$tempDirName/*" -DestinationPath $zipFile
    if (-not (Test-Path $zipFile)) { throw "ZIP creation failed." }

    # Cleanup
    Write-Status "Cleaning up..."
    Remove-Item $tempDirName -Recurse -Force

    Write-Status "Package created: $zipFile"
} catch {
    Write-ErrorMessage $_.Exception.Message
    if (Test-Path $tempDirName) { Remove-Item $tempDirName -Recurse -Force }
    exit 1
}
