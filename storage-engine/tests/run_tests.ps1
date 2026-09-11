# Automated Test Runner for Storage Engine (Phase 1)
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$engineDir = Split-Path -Parent $scriptDir
$testTmpDir = Join-Path $scriptDir "test_output"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " Running Storage Engine Test Suite (Phase 1)" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Locate CMake and Executable
$cmakePath = "cmake"
if (-not (Get-Command "cmake" -ErrorAction SilentlyContinue)) {
    $vsCmake = "C:\Program Files\Microsoft Visual Studio\18\Insiders\Common7\IDE\CommonExtensions\Microsoft\CMake\CMake\bin\cmake.exe"
    if (Test-Path $vsCmake) {
        $cmakePath = $vsCmake
    }
}

$exeCandidates = @(
    (Join-Path $engineDir "build\Release\storage_engine.exe"),
    (Join-Path $engineDir "build\Debug\storage_engine.exe"),
    (Join-Path $engineDir "build\storage_engine.exe")
)

$exePath = $null
foreach ($candidate in $exeCandidates) {
    if (Test-Path $candidate) {
        $exePath = $candidate
        break
    }
}

if (-not $exePath) {
    Write-Host "Executable not found. Building project with CMake..." -ForegroundColor Yellow
    Push-Location $engineDir
    try {
        & $cmakePath -B build -S .
        & $cmakePath --build build --config Release
    } finally {
        Pop-Location
    }

    foreach ($candidate in $exeCandidates) {
        if (Test-Path $candidate) {
            $exePath = $candidate
            break
        }
    }
}

if (-not $exePath) {
    Write-Error "Failed to locate compiled storage_engine executable."
    exit 1
}

Write-Host "Using Executable: $exePath`n" -ForegroundColor Green

# Prepare test output directories
if (Test-Path $testTmpDir) {
    Remove-Item -Recurse -Force $testTmpDir
}
New-Item -ItemType Directory -Path $testTmpDir -Force | Out-Null

$passCount = 0
$totalCount = 0

function Run-Test {
    param (
        [string]$TestName,
        [scriptblock]$Action
    )
    $global:totalCount++
    Write-Host "[$global:totalCount] Testing: $TestName..." -NoNewline
    try {
        & $Action
        Write-Host " [PASS]" -ForegroundColor Green
        $global:passCount++
    } catch {
        Write-Host " [FAIL]" -ForegroundColor Red
        Write-Host "    Error: $_" -ForegroundColor Red
    }
}

# --- Test 1: Small File (< 1 MB) ---
Run-Test "Small text file (< 1 MB)" {
    $inputFile = Join-Path $testTmpDir "small_test.txt"
    $chunksDir = Join-Path $engineDir "chunks"
    
    # Create 200 KB text file
    $content = "A" * 204800
    [System.IO.File]::WriteAllText($inputFile, $content)
    $originalSize = (Get-Item $inputFile).Length

    # Clear chunks directory
    Get-ChildItem -Path $chunksDir -Exclude ".gitkeep" | Remove-Item -Force

    # Run storage engine
    $output = & $exePath $inputFile
    if ($LASTEXITCODE -ne 0) { throw "Process exited with code $LASTEXITCODE" }

    $createdChunks = Get-ChildItem -Path $chunksDir -Filter "chunk_*"
    if ($createdChunks.Count -ne 1) { throw "Expected 1 chunk, got $($createdChunks.Count)" }

    $totalChunkSize = ($createdChunks | Measure-Object -Property Length -Sum).Sum
    if ($totalChunkSize -ne $originalSize) {
        throw "Size mismatch: original ($originalSize) vs chunks ($totalChunkSize)"
    }
}

# --- Test 2: Exactly 1 MB File ---
Run-Test "File exactly 1 MB (1,048,576 bytes)" {
    $inputFile = Join-Path $testTmpDir "exact_1mb.bin"
    $chunksDir = Join-Path $engineDir "chunks"

    # Create 1 MB file (1048576 bytes)
    $bytes = New-Object byte[] 1048576
    (New-Object Random).NextBytes($bytes)
    [System.IO.File]::WriteAllBytes($inputFile, $bytes)
    $originalSize = (Get-Item $inputFile).Length

    Get-ChildItem -Path $chunksDir -Exclude ".gitkeep" | Remove-Item -Force

    $output = & $exePath $inputFile
    if ($LASTEXITCODE -ne 0) { throw "Process exited with code $LASTEXITCODE" }

    $createdChunks = Get-ChildItem -Path $chunksDir -Filter "chunk_*"
    if ($createdChunks.Count -ne 1) { throw "Expected exactly 1 chunk, got $($createdChunks.Count)" }

    $totalChunkSize = ($createdChunks | Measure-Object -Property Length -Sum).Sum
    if ($totalChunkSize -ne $originalSize) {
        throw "Size mismatch: original ($originalSize) vs chunks ($totalChunkSize)"
    }
}

# --- Test 3: Large File (> 1 MB, 2.5 MB) ---
Run-Test "File larger than 1 MB (2.5 MB -> 3 chunks)" {
    $inputFile = Join-Path $testTmpDir "large_2.5mb.bin"
    $chunksDir = Join-Path $engineDir "chunks"

    # Create 2.5 MB file (2,621,440 bytes)
    $size = 2621440
    $bytes = New-Object byte[] $size
    (New-Object Random).NextBytes($bytes)
    [System.IO.File]::WriteAllBytes($inputFile, $bytes)
    $originalSize = (Get-Item $inputFile).Length

    Get-ChildItem -Path $chunksDir -Exclude ".gitkeep" | Remove-Item -Force

    $output = & $exePath $inputFile
    if ($LASTEXITCODE -ne 0) { throw "Process exited with code $LASTEXITCODE" }

    $createdChunks = Get-ChildItem -Path $chunksDir -Filter "chunk_*"
    if ($createdChunks.Count -ne 3) { throw "Expected 3 chunks, got $($createdChunks.Count)" }

    $totalChunkSize = ($createdChunks | Measure-Object -Property Length -Sum).Sum
    if ($totalChunkSize -ne $originalSize) {
        throw "Size mismatch: original ($originalSize) vs chunks ($totalChunkSize)"
    }
}

# --- Test 4: Custom Chunk Size on Binary File ---
Run-Test "Binary file with custom chunk size (512 KB)" {
    $inputFile = Join-Path $testTmpDir "binary_custom.bin"
    $chunksDir = Join-Path $engineDir "chunks"
    $customChunkSize = 524288 # 512 KB

    # Create 1.3 MB binary file (1,363,148 bytes)
    $size = 1363148
    $bytes = New-Object byte[] $size
    (New-Object Random).NextBytes($bytes)
    [System.IO.File]::WriteAllBytes($inputFile, $bytes)
    $originalSize = (Get-Item $inputFile).Length

    Get-ChildItem -Path $chunksDir -Exclude ".gitkeep" | Remove-Item -Force

    $output = & $exePath $inputFile $customChunkSize
    if ($LASTEXITCODE -ne 0) { throw "Process exited with code $LASTEXITCODE" }

    $createdChunks = Get-ChildItem -Path $chunksDir -Filter "chunk_*"
    # 1363148 / 524288 = 2 full chunks + 1 remainder chunk = 3 chunks
    if ($createdChunks.Count -ne 3) { throw "Expected 3 chunks, got $($createdChunks.Count)" }

    $totalChunkSize = ($createdChunks | Measure-Object -Property Length -Sum).Sum
    if ($totalChunkSize -ne $originalSize) {
        throw "Size mismatch: original ($originalSize) vs chunks ($totalChunkSize)"
    }
}

# --- Test 5: Non-existent Input File ---
Run-Test "Non-existent input file (Error handling)" {
    $nonExistent = Join-Path $testTmpDir "does_not_exist_12345.bin"
    
    $proc = Start-Process -FilePath $exePath -ArgumentList "`"$nonExistent`"" -NoNewWindow -Wait -PassThru -RedirectStandardError (Join-Path $testTmpDir "err5.txt")
    if ($proc.ExitCode -eq 0) {
        throw "Expected process to fail with non-zero exit code, but got 0"
    }
    $errMsg = Get-Content (Join-Path $testTmpDir "err5.txt") -Raw
    if ($errMsg -notmatch "does not exist") {
        throw "Expected error message indicating file does not exist, got: $errMsg"
    }
}

# --- Test 6: Invalid Chunk Size ---
Run-Test "Invalid chunk size parameter (Error handling)" {
    $inputFile = Join-Path $testTmpDir "small_test.txt"

    $proc = Start-Process -FilePath $exePath -ArgumentList "`"$inputFile`" abc_invalid" -NoNewWindow -Wait -PassThru -RedirectStandardError (Join-Path $testTmpDir "err6.txt")
    if ($proc.ExitCode -eq 0) {
        throw "Expected process to fail with non-zero exit code on invalid chunk size, but got 0"
    }
    $errMsg = Get-Content (Join-Path $testTmpDir "err6.txt") -Raw
    if ($errMsg -notmatch "Invalid chunk size") {
        throw "Expected error message indicating invalid chunk size, got: $errMsg"
    }
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host " Test Summary: $passCount / $totalCount Passed" -ForegroundColor $(if ($passCount -eq $totalCount) { "Green" } else { "Red" })
Write-Host "==================================================" -ForegroundColor Cyan

# Cleanup temporary files
Remove-Item -Recurse -Force $testTmpDir -ErrorAction SilentlyContinue

if ($passCount -ne $totalCount) {
    exit 1
}
