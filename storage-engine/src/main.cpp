#include "Chunker.h"

#include <iostream>
#include <string>
#include <cstdlib>
#include <cctype>
#include <algorithm>

void printUsage(const char* programName) {
    std::cout << "AI-Powered Personal Data Vault - Storage Engine (Phase 1)" << std::endl;
    std::cout << "Usage:" << std::endl;
    std::cout << "  " << programName << " <input_file> [chunk_size_in_bytes]" << std::endl;
    std::cout << "\nArguments:" << std::endl;
    std::cout << "  <input_file>            Path to the input file to chunk (required)" << std::endl;
    std::cout << "  [chunk_size_in_bytes]   Size of each chunk in bytes (optional, default: 1048576 [1 MB])" << std::endl;
    std::cout << "\nExamples:" << std::endl;
    std::cout << "  " << programName << " document.pdf" << std::endl;
    std::cout << "  " << programName << " archive.zip 524288" << std::endl;
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cerr << "Error: Missing input file argument.\n" << std::endl;
        printUsage(argv[0]);
        return 1;
    }

    std::string inputFile = argv[1];
    std::string outputDir = "chunks";
    std::size_t chunkSize = Chunker::DEFAULT_CHUNK_SIZE;

    // Parse optional chunk_size argument
    if (argc >= 3) {
        std::string sizeStr = argv[2];

        // Check if string contains only digits
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

    try {
        Chunker chunker(inputFile, outputDir, chunkSize);
        chunker.split();
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    } catch (...) {
        std::cerr << "Error: An unexpected error occurred during execution." << std::endl;
        return 1;
    }

    return 0;
}
