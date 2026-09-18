#include "Chunker.h"
#include "NodeManager.h"
#include "Manifest.h"

#include <iostream>
#include <string>
#include <vector>
#include <cstdlib>
#include <cctype>
#include <algorithm>
#include <filesystem>

namespace fs = std::filesystem;

void printUsage(const char* programName) {
    std::cout << "AI-Powered Personal Data Vault - Distributed Storage Engine" << std::endl;
    std::cout << "============================================================" << std::endl;
    std::cout << "Usage:" << std::endl;
    std::cout << "  " << programName << " store <input_file> [options]       # Chunk & replicate across storage nodes" << std::endl;
    std::cout << "  " << programName << " restore <manifest_path> <output>    # Reconstruct original file from nodes" << std::endl;
    std::cout << "  " << programName << " status [options]                   # Check node health and storage metrics" << std::endl;
    std::cout << "  " << programName << " chunk <input_file> [chunk_size]    # Legacy single-directory chunking" << std::endl;
    std::cout << "\nStore Options:" << std::endl;
    std::cout << "  --chunk-size <bytes>    Size of each chunk (default: 1048576 [1 MB])" << std::endl;
    std::cout << "  --replicas <count>      Number of node replicas per chunk (default: 2)" << std::endl;
    std::cout << "  --node-count <count>    Number of storage nodes in cluster (default: 3)" << std::endl;
    std::cout << "  --nodes-dir <path>      Base directory for storage nodes (default: 'nodes')" << std::endl;
    std::cout << "  --manifest <path>       Output path for metadata manifest JSON" << std::endl;
    std::cout << "  --json                  Output JSON format on stdout for API/Spring Boot" << std::endl;
    std::cout << "\nStatus Options:" << std::endl;
    std::cout << "  --nodes-dir <path>      Base directory for storage nodes (default: 'nodes')" << std::endl;
    std::cout << "  --node-count <count>    Number of storage nodes (default: 3)" << std::endl;
    std::cout << "  --json                  Output status as JSON for Spring Boot backend" << std::endl;
    std::cout << "\nExamples:" << std::endl;
    std::cout << "  " << programName << " store sample.pdf --replicas 2" << std::endl;
    std::cout << "  " << programName << " restore metadata/manifests/vault_sample_123.json restored_sample.pdf" << std::endl;
    std::cout << "  " << programName << " status --json" << std::endl;
}

int handleStore(int argc, char* argv[]) {
    if (argc < 3) {
        std::cerr << "Error: Missing input file path for 'store' command." << std::endl;
        return 1;
    }

    std::string inputFile = argv[2];
    std::size_t chunkSize = Chunker::DEFAULT_CHUNK_SIZE;
    std::size_t replicationFactor = Chunker::DEFAULT_REPLICATION_FACTOR;
    std::size_t nodeCount = 3;
    std::string nodesDir = "nodes";
    std::string manifestPath = "";
    bool jsonOutput = false;

    for (int i = 3; i < argc; ++i) {
        std::string arg = argv[i];
        if (arg == "--chunk-size" && i + 1 < argc) {
            chunkSize = std::stoull(argv[++i]);
        } else if (arg == "--replicas" && i + 1 < argc) {
            replicationFactor = std::stoull(argv[++i]);
        } else if (arg == "--node-count" && i + 1 < argc) {
            nodeCount = std::stoull(argv[++i]);
        } else if (arg == "--nodes-dir" && i + 1 < argc) {
            nodesDir = argv[++i];
        } else if (arg == "--manifest" && i + 1 < argc) {
            manifestPath = argv[++i];
        } else if (arg == "--json") {
            jsonOutput = true;
        }
    }

    if (chunkSize == 0) {
        std::cerr << "Error: Chunk size must be greater than 0 bytes." << std::endl;
        return 1;
    }

    try {
        NodeManager nodeManager(nodesDir);
        nodeManager.initDefaultNodes(nodeCount);

        Chunker chunker(inputFile, "chunks", chunkSize);
        FileManifest manifest = chunker.splitToNodes(nodeManager, replicationFactor, manifestPath);

        if (jsonOutput) {
            std::cout << "\n--- JSON_MANIFEST_START ---\n"
                      << manifest.toJson()
                      << "--- JSON_MANIFEST_END ---\n";
        }
        return 0;
    } catch (const std::exception& e) {
        std::cerr << "Store Error: " << e.what() << std::endl;
        return 1;
    }
}

int handleRestore(int argc, char* argv[]) {
    if (argc < 4) {
        std::cerr << "Error: 'restore' requires <manifest_path> and <output_file_path>." << std::endl;
        return 1;
    }

    std::string manifestPath = argv[2];
    std::string outputPath = argv[3];
    std::string nodesDir = "nodes";

    for (int i = 4; i < argc; ++i) {
        std::string arg = argv[i];
        if (arg == "--nodes-dir" && i + 1 < argc) {
            nodesDir = argv[++i];
        }
    }

    try {
        FileManifest manifest = FileManifest::loadFromFile(manifestPath);
        NodeManager nodeManager(nodesDir);
        nodeManager.restoreFile(manifest, outputPath);
        return 0;
    } catch (const std::exception& e) {
        std::cerr << "Restore Error: " << e.what() << std::endl;
        return 1;
    }
}

int handleStatus(int argc, char* argv[]) {
    std::string nodesDir = "nodes";
    std::size_t nodeCount = 3;
    bool jsonOutput = false;

    for (int i = 2; i < argc; ++i) {
        std::string arg = argv[i];
        if (arg == "--nodes-dir" && i + 1 < argc) {
            nodesDir = argv[++i];
        } else if (arg == "--node-count" && i + 1 < argc) {
            nodeCount = std::stoull(argv[++i]);
        } else if (arg == "--json") {
            jsonOutput = true;
        }
    }

    try {
        NodeManager nodeManager(nodesDir);
        nodeManager.initDefaultNodes(nodeCount);
        nodeManager.printStatus(jsonOutput);
        return 0;
    } catch (const std::exception& e) {
        std::cerr << "Status Error: " << e.what() << std::endl;
        return 1;
    }
}

int handleLegacyChunk(int argc, char* argv[], int offset = 1) {
    if (argc <= offset) {
        std::cerr << "Error: Missing input file argument.\n" << std::endl;
        printUsage(argv[0]);
        return 1;
    }

    std::string inputFile = argv[offset];
    std::string outputDir = "chunks";
    std::size_t chunkSize = Chunker::DEFAULT_CHUNK_SIZE;

    if (argc > offset + 1) {
        std::string sizeStr = argv[offset + 1];
        bool isAllDigits = !sizeStr.empty() && std::all_of(sizeStr.begin(), sizeStr.end(), [](unsigned char c) {
            return std::isdigit(c);
        });

        if (!isAllDigits) {
            std::cerr << "Error: Invalid chunk size '" << sizeStr 
                      << "'. Chunk size must be a positive numeric value in bytes." << std::endl;
            return 1;
        }

        try {
            unsigned long long parsedSize = std::stoull(sizeStr);
            if (parsedSize == 0) {
                std::cerr << "Error: Chunk size must be greater than 0 bytes." << std::endl;
                return 1;
            }
            chunkSize = static_cast<std::size_t>(parsedSize);
        } catch (const std::exception& e) {
            std::cerr << "Error: Chunk size value is out of range: " << e.what() << std::endl;
            return 1;
        }
    }

    if (argc > offset + 2) {
        outputDir = argv[offset + 2];
    }

    try {
        Chunker chunker(inputFile, outputDir, chunkSize);
        chunker.split();
        return 0;
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        printUsage(argv[0]);
        return 1;
    }

    std::string command = argv[1];

    if (command == "-h" || command == "--help" || command == "help") {
        printUsage(argv[0]);
        return 0;
    }

    if (command == "store") {
        return handleStore(argc, argv);
    } else if (command == "restore") {
        return handleRestore(argc, argv);
    } else if (command == "status") {
        return handleStatus(argc, argv);
    } else if (command == "chunk") {
        return handleLegacyChunk(argc, argv, 2);
    } else {
        // If first argument is not a command keyword, treat as direct file chunking (backwards-compatible)
        return handleLegacyChunk(argc, argv, 1);
    }
}
