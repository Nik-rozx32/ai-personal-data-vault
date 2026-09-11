# Storage Engine - AI-Powered Personal Data Vault

Welcome to the **Storage Engine** module of the **AI-Powered Personal Data Vault**.

This component is written in modern **C++17** and serves as the low-level data storage foundation.

---

## 1. What the Storage Engine Does (Phase 1)

In **Phase 1**, the storage engine provides high-performance binary file chunking:
- Takes any arbitrary file format (PDF, JPG, PNG, MP4, ZIP, TXT, etc.).
- Streams the file in fixed-size memory buffers (default **1 MB**).
- Splits the file into standalone binary chunks: `chunk_0000`, `chunk_0001`, `chunk_0002`, ...
- Preserves 100% of the original file bytes without loading large files into RAM.
- Automatically creates the output directory (`chunks/`) if it does not already exist.

---

## 2. Why File Chunking is Essential for a Personal Data Vault

When building a distributed, encrypted personal data vault:
1. **Memory Efficiency**: Large files (such as 4K videos or database backups) can be processed without exhausting system RAM.
2. **Distributed Storage**: Chunks can later be distributed across different storage nodes, cloud providers, or drives.
3. **Resilience & Fault Tolerance**: If a transfer fails or a node goes offline, only the affected chunk needs to be retransmitted or retrieved from a replica rather than the entire multi-gigabyte file.
4. **Deduplication & Encryption**: Granular chunking enables content-addressable storage (CAS) and chunk-level encryption in upcoming phases.

---

## 3. Project Structure

```
storage-engine/
│
├── include/
│   └── Chunker.h           # Class declaration and public API
│
├── src/
│   ├── Chunker.cpp         # Binary streaming & chunking implementation
│   └── main.cpp            # Command-line interface & argument parser
│
├── chunks/                 # Output folder for generated chunk files
│   └── .gitkeep
│
├── tests/                  # Automated and manual testing suite
│   ├── README.md           # Testing instructions & test matrix
│   └── run_tests.ps1       # Automated PowerShell test runner
│
├── CMakeLists.txt          # CMake build configuration (C++17)
├── README.md               # Documentation & usage guide
└── .gitignore              # Ignores build outputs and chunk files
```

---

## 4. How to Build Using CMake

### Prerequisites
- CMake 3.20 or newer
- C++17 compatible compiler (e.g. MSVC / Visual Studio, GCC, Clang)

### Build Steps

1. Navigate to the `storage-engine/` directory:
   ```bash
   cd storage-engine
   ```

2. Create a build directory and configure CMake:
   ```bash
   cmake -B build -S .
   ```

3. Compile the project:
   ```bash
   cmake --build build --config Release
   ```

The compiled executable `storage_engine` (or `storage_engine.exe` on Windows) will be placed in `build/` (or `build/Release/`).

---

## 5. How to Run the Program

### Command Syntax
```bash
storage_engine <input_file> [chunk_size_in_bytes]
```

- `<input_file>`: Path to the target file to be chunked (required).
- `[chunk_size_in_bytes]`: Optional chunk size in bytes. Default is **1,048,576 bytes** (1 MB).

---

## 6. Example Commands

### Default 1 MB Chunks
```bash
./build/Release/storage_engine sample.pdf
```

### Custom Chunk Size (e.g., 512 KB = 524,288 bytes)
```bash
./build/Release/storage_engine archive.zip 524288
```

### Custom Chunk Size (e.g., 64 KB = 65,536 bytes)
```bash
./build/Release/storage_engine notes.txt 65536
```

---

## 7. Example Output

```text
Starting chunking process...
Input File       : sample.pdf
Output Directory : chunks
Chunk Size       : 1048576 bytes (1.00 MB)
--------------------------------------------------
  [+] Created chunk_0000 (1048576 bytes) -> chunks/chunk_0000
  [+] Created chunk_0001 (1048576 bytes) -> chunks/chunk_0001
  [+] Created chunk_0002 (450123 bytes) -> chunks/chunk_0002
--------------------------------------------------
Chunking completed successfully!
Original File Path : sample.pdf
Chunks Created     : 3
Total Bytes        : 2547275 bytes
Configured Size    : 1048576 bytes per chunk
==================================================
```

---

## 8. Current Limitations (Phase 1 Scope)

> [!NOTE]
> This is **Phase 1: Basic File Chunking Engine**.

The following capabilities are deliberately **not included** in Phase 1 and will be introduced in subsequent phases:
- File reassembly (merging chunks back to the original file)
- SHA-256 cryptographic chunk hashing
- Chunk corruption detection & verification
- Data replication across multiple storage nodes
- Distributed networking / RPC layer
- Spring Boot backend integration
