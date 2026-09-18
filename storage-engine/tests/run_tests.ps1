# Automated Test Runner for Storage Engine (Phase 1 & Phase 2 Multi-Node)
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$engineDir = Split-Path -Parent $scriptDir
$testTmpDir = Join-Path $scriptDir "test_output"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " Running Storage Engine Test Suite (Phases 1 & 2)" -ForegroundColor Cyan
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

# =========================================================================
# PHASE 1 TESTS: Basic Single-Directory Chunking
# =========================================================================

# --- Test 1: Small File (< 1 MB) ---
Run-Test "Small text file (< 1 MB)" {
    $inputFile = Join-Path $testTmpDir "small_test.txt"
    $chunksDir = Join-Path $engineDir "chunks"
    
    $content = "A" * 204800
    [System.IO.File]::WriteAllText($inputFile, $content)
    $originalSize = (Get-Item $inputFile).Length

    Get-ChildItem -Path $chunksDir -Exclude ".gitkeep" -ErrorAction SilentlyContinue | Remove-Item -Force

    $output = & $exePath chunk $inputFile
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

    $bytes = New-Object byte[] 1048576
    (New-Object Random).NextBytes($bytes)
    [System.IO.File]::WriteAllBytes($inputFile, $bytes)
    $originalSize = (Get-Item $inputFile).Length

    Get-ChildItem -Path $chunksDir -Exclude ".gitkeep" -ErrorAction SilentlyContinue | Remove-Item -Force

    $output = & $exePath chunk $inputFile
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

    $size = 2621440
    $bytes = New-Object byte[] $size
    (New-Object Random).NextBytes($bytes)
    [System.IO.File]::WriteAllBytes($inputFile, $bytes)
    $originalSize = (Get-Item $inputFile).Length

    Get-ChildItem -Path $chunksDir -Exclude ".gitkeep" -ErrorAction SilentlyContinue | Remove-Item -Force

    $output = & $exePath chunk $inputFile
    if ($LASTEXITCODE -ne 0) { throw "Process exited with code $LASTEXITCODE" }

    $createdChunks = Get-ChildItem -Path $chunksDir -Filter "chunk_*"
    if ($createdChunks.Count -ne 3) { throw "Expected 3 chunks, got $($createdChunks.Count)" }

    $totalChunkSize = ($createdChunks | Measure-Object -Property Length -Sum).Sum
    if ($totalChunkSize -ne $originalSize) {
        throw "Size mismatch: original ($originalSize) vs chunks ($totalChunkSize)"
    }
}

# =========================================================================
# PHASE 2 TESTS: Multi-Node Replication, Manifest, & Failover Restore
# =========================================================================

# --- Test 4: Multi-Node Chunk Replication (3 Nodes, R=2) ---
Run-Test "Multi-node chunk distribution & 2x replication" {
    $inputFile = Join-Path $testTmpDir "multi_node_doc.bin"
    $nodesDir = Join-Path $testTmpDir "test_nodes"
    $manifestFile = Join-Path $testTmpDir "manifest_test.json"

    # Create 2.2 MB binary file (2,306,867 bytes) -> with 1MB chunk size = 3 chunks
    $size = 2306867
    $bytes = New-Object byte[] $size
    (New-Object Random).NextBytes($bytes)
    [System.IO.File]::WriteAllBytes($inputFile, $bytes)

    $output = & $exePath store $inputFile --chunk-size 1048576 --replicas 2 --node-count 3 --nodes-dir $nodesDir --manifest $manifestFile
    if ($LASTEXITCODE -ne 0) { throw "Store failed with exit code $LASTEXITCODE" }

    if (-not (Test-Path $manifestFile)) { throw "Manifest JSON file was not generated" }

    # Verify nodes directory
    $n1 = Join-Path $nodesDir "node_1"
    $n2 = Join-Path $nodesDir "node_2"
    $n3 = Join-Path $nodesDir "node_3"
    if (-not (Test-Path $n1) -or -not (Test-Path $n2) -or -not (Test-Path $n3)) {
        throw "Not all 3 node directories were created"
    }

    # Total stored chunk copies across nodes must equal 3 chunks * 2 replicas = 6 files
    $allChunkFiles = Get-ChildItem -Path $nodesDir -Recurse -Filter "chunk_*"
    if ($allChunkFiles.Count -ne 6) {
        throw "Expected 6 chunk copies across nodes (3 chunks x 2 replicas), got $($allChunkFiles.Count)"
    }
}

# --- Test 5: Reconstruct File from Multi-Node Manifest (SHA-256 Parity) ---
Run-Test "Restore file from nodes and verify SHA-256 integrity" {
    $inputFile = Join-Path $testTmpDir "multi_node_doc.bin"
    $nodesDir = Join-Path $testTmpDir "test_nodes"
    $manifestFile = Join-Path $testTmpDir "manifest_test.json"
    $restoredFile = Join-Path $testTmpDir "restored_doc.bin"

    $output = & $exePath restore $manifestFile $restoredFile --nodes-dir $nodesDir
    if ($LASTEXITCODE -ne 0) { throw "Restore command failed with exit code $LASTEXITCODE" }

    $origHash = (Get-FileHash $inputFile -Algorithm SHA256).Hash
    $restoredHash = (Get-FileHash $restoredFile -Algorithm SHA256).Hash

    if ($origHash -ne $restoredHash) {
        throw "Checksum mismatch: Original ($origHash) vs Restored ($restoredHash)"
    }
}

# --- Test 6: Fault-Tolerance & Replica Failover Test ---
Run-Test "Replica failover recovery (corrupted/missing node chunk)" {
    $inputFile = Join-Path $testTmpDir "multi_node_doc.bin"
    $nodesDir = Join-Path $testTmpDir "test_nodes"
    $manifestFile = Join-Path $testTmpDir "manifest_test.json"
    $failoverRestored = Join-Path $testTmpDir "failover_restored.bin"

    # Simulate node failure / disk corruption: delete primary chunk_0000 in node_1
    $primaryChunk = Join-Path $nodesDir "node_1\chunk_0000"
    if (Test-Path $primaryChunk) {
        Remove-Item $primaryChunk -Force
    }

    # Attempt restoration (should automatically fetch chunk_0000 from replica in node_2)
    $output = & $exePath restore $manifestFile $failoverRestored --nodes-dir $nodesDir
    if ($LASTEXITCODE -ne 0) { throw "Failover restore failed with exit code $LASTEXITCODE" }

    $origHash = (Get-FileHash $inputFile -Algorithm SHA256).Hash
    $restoredHash = (Get-FileHash $failoverRestored -Algorithm SHA256).Hash

    if ($origHash -ne $restoredHash) {
        throw "Failover restored file hash does not match original file hash"
    }
}

# --- Test 7: Node Status Query (Spring Boot JSON & Human Readable) ---
Run-Test "Node status inspection with JSON schema" {
    $nodesDir = Join-Path $testTmpDir "test_nodes"

    # Text status
    $statusText = & $exePath status --nodes-dir $nodesDir --node-count 3
    if ($LASTEXITCODE -ne 0) { throw "Status command failed" }

    # JSON status for Spring Boot
    $statusJson = & $exePath status --nodes-dir $nodesDir --node-count 3 --json
    if ($LASTEXITCODE -ne 0) { throw "Status --json failed" }

    $parsed = $statusJson | ConvertFrom-Json
    if ($parsed.nodes.Count -ne 3) {
        throw "Expected 3 nodes in status JSON, got $($parsed.nodes.Count)"
    }
    if ($parsed.nodes[0].isHealthy -ne $true) {
        throw "Expected node_1 to be healthy"
    }
}

# --- Test 8: Non-existent Input File (Error handling) ---
Run-Test "Non-existent input file (Error handling)" {
    $nonExistent = Join-Path $testTmpDir "does_not_exist_12345.bin"
    
    $proc = Start-Process -FilePath $exePath -ArgumentList "store `"$nonExistent`"" -NoNewWindow -Wait -PassThru -RedirectStandardError (Join-Path $testTmpDir "err8.txt")
    if ($proc.ExitCode -eq 0) {
        throw "Expected process to fail with non-zero exit code, but got 0"
    }
    $errMsg = Get-Content (Join-Path $testTmpDir "err8.txt") -Raw
    if ($errMsg -notmatch "does not exist") {
        throw "Expected error message indicating file does not exist, got: $errMsg"
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
