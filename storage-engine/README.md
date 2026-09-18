# Storage Engine - AI-Powered Personal Data Vault

Welcome to the **Storage Engine** module of the **AI-Powered Personal Data Vault**.

This component is written in modern **C++17** and serves as the high-performance distributed data storage foundation for the vault.

---

## 1. What the Storage Engine Does

The storage engine provides distributed chunking, multi-node replication, and fault-tolerant file reassembly:
- **Binary Stream Chunking**: Takes any file format (PDF, JPG, PNG, MP4, ZIP, TXT, etc.) and streams it in fixed-size buffers (default **1 MB**).
- **Multi-Node Replication**: Distributes and replicates binary chunks across a configurable cluster of storage nodes (`node_1`, `node_2`, `node_3`, ...) with a configurable replication factor ($R \ge 1$).
- **JSON Manifest Generation**: Emits a structured JSON manifest tracking file metadata and exact chunk-to-node placements for Spring Boot and UI clients.
- **Fault-Tolerant Reassembly (`restore`)**: Reconstructs the original file byte-for-byte from distributed nodes with automatic failover to replica nodes if a node or chunk is missing.
- **Spring Boot Ready**: Provides `--json` flags on all operations for direct process integration or REST API wrapping.

---

## 2. Project Structure

```
storage-engine/
│
├── include/
│   ├── Chunker.h           # Stream chunking API
│   ├── NodeManager.h       # Node cluster management, replication, and failover
│   └── Manifest.h          # JSON Metadata Manifest model and serializer
│
├── src/
│   ├── Chunker.cpp         # Binary streaming & multi-node pipeline
│   ├── NodeManager.cpp     # Storage nodes & replica failover implementation
│   ├── Manifest.cpp        # JSON parser and serializer (zero external dependencies)
│   └── main.cpp            # Command-line interface supporting store, restore, status
│
├── nodes/                  # Storage cluster node directories
│   ├── node_1/
│   ├── node_2/
│   └── node_3/
│
├── metadata/               # JSON manifests consumable by Spring Boot
│   └── manifests/
│
├── chunks/                 # Output folder for legacy single-directory chunking
│
├── tests/                  # Automated PowerShell test suite
│   ├── README.md
│   └── run_tests.ps1       # Comprehensive 8-test validation suite
│
├── CMakeLists.txt          # CMake build configuration (C++17)
└── README.md               # Documentation & usage guide
```

---

## 3. How to Build Using CMake

### Prerequisites
- CMake 3.20 or newer
- C++17 compatible compiler (e.g. MSVC / Visual Studio, GCC, Clang)

### Build Steps

```bash
cd storage-engine
cmake -B build -S .
cmake --build build --config Release
```

The compiled binary `storage_engine.exe` will be located in `build/Release/`.

---

## 4. CLI Commands & Usage

### A. Store & Replicate a File (`store`)
```bash
./build/Release/storage_engine store <input_file> [options]
```

**Options:**
- `--chunk-size <bytes>`: Size of each chunk in bytes (default: `1048576` [1 MB]).
- `--replicas <count>`: Number of node replicas per chunk (default: `2`).
- `--node-count <count>`: Number of nodes in the cluster (default: `3`).
- `--nodes-dir <path>`: Base directory for node storage (default: `nodes`).
- `--manifest <path>`: Destination path for the metadata JSON file.
- `--json`: Outputs JSON manifest to standard output (for Spring Boot integration).

**Example:**
```bash
./build/Release/storage_engine store my_document.pdf --replicas 2 --chunk-size 1048576
```

---

### B. Restore a File from Nodes (`restore`)
```bash
./build/Release/storage_engine restore <manifest_json_path> <output_file> [--nodes-dir <path>]
```

**Example:**
```bash
./build/Release/storage_engine restore metadata/manifests/vault_my_document_178970.json restored_doc.pdf
```

---

### C. Check Cluster Node Status (`status`)
```bash
# Human readable table
./build/Release/storage_engine status

# JSON schema for Spring Boot backend
./build/Release/storage_engine status --json
```

**JSON Output Example (Spring Boot):**
```json
{
  "nodes": [
    {
      "id": "node_1",
      "path": "nodes/node_1",
      "isHealthy": true,
      "chunkCount": 3,
      "totalBytes": 25000
    },
    {
      "id": "node_2",
      "path": "nodes/node_2",
      "isHealthy": true,
      "chunkCount": 3,
      "totalBytes": 25000
    },
    {
      "id": "node_3",
      "path": "nodes/node_3",
      "isHealthy": true,
      "chunkCount": 2,
      "totalBytes": 16808
    }
  ]
}
```

---

## 5. Running Automated Tests

Run the full automated test suite with PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File .\tests\run_tests.ps1
```
Tests cover:
1. Small file chunking (< 1 MB)
2. Exact 1 MB boundary chunking
3. Large file multi-chunking (> 1 MB)
4. Multi-node chunk distribution & 2x replication
5. File restore & SHA-256 binary parity validation
6. Replica failover recovery (automatic self-healing when a primary chunk is lost)
7. Node status JSON schema verification
8. Missing file error handling
