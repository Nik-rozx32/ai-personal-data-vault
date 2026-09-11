# Storage Engine Test Suite

This directory contains test plans and automated scripts to verify the functionality of the C++ Storage Engine.

## Test Matrix

| # | Test Scenario | Expected Outcome | Verification |
|---|---------------|------------------|--------------|
| 1 | File smaller than 1 MB (e.g. 250 KB text file) | Exactly 1 chunk created | Chunk size == original file size |
| 2 | File exactly 1 MB (1,048,576 bytes) | Exactly 1 chunk created (1 MB) | Chunk size == 1,048,576 bytes |
| 3 | File larger than 1 MB (e.g. 2.5 MB) | 3 chunks created (1 MB, 1 MB, 0.5 MB) | Sum of all chunk sizes == original file size |
| 4 | Binary file with arbitrary byte sequences | Exact binary preservation across chunks | Sum of all chunk sizes == original file size |
| 5 | Non-existent input file | Fails gracefully with clean error message (Exit Code 1) | Program terminates with error |
| 6 | Invalid chunk size (0 or non-numeric) | Fails gracefully with clean error message (Exit Code 1) | Program terminates with error |

---

## Running Automated Tests

To run the automated PowerShell test runner:

```powershell
powershell -ExecutionPolicy Bypass -File ./tests/run_tests.ps1
```

The test runner will:
1. Build the project using CMake if not yet built.
2. Generate temporary test files for each scenario.
3. Run `storage_engine` against each test file.
4. Verify chunk file creation, byte totals, and exit codes.
5. Clean up temporary test files upon completion.
