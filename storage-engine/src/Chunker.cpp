#include "Chunker.h"

#include <fstream>
#include <iostream>
#include <filesystem>
#include <vector>
#include <iomanip>
#include <sstream>
#include <stdexcept>
#include <system_error>

namespace fs = std::filesystem;

Chunker::Chunker(
    const std::string& inputFile,
    const std::string& outputDirectory,
    std::size_t chunkSize
)
    : inputFile(inputFile),
      outputDirectory(outputDirectory),
      chunkSize(chunkSize)
{
    if (chunkSize == 0) {
        throw std::invalid_argument("Chunk size must be greater than 0 bytes.");
    }
}

void Chunker::split() {
    // 1. Validate input file exists
    std::error_code ec;
    if (!fs::exists(inputFile, ec)) {
        throw std::runtime_error("Input file does not exist: " + inputFile);
    }
    if (fs::is_directory(inputFile, ec)) {
        throw std::runtime_error("Input path is a directory, not a regular file: " + inputFile);
    }

    // 2. Ensure output directory exists
    if (!outputDirectory.empty()) {
        fs::create_directories(outputDirectory, ec);
        if (ec) {
            throw std::runtime_error("Failed to create output directory '" + outputDirectory + "': " + ec.message());
        }
    }

    // 3. Open input file in binary mode
    std::ifstream inFile(inputFile, std::ios::binary);
    if (!inFile.is_open()) {
        throw std::runtime_error("Failed to open input file for reading: " + inputFile);
    }

    // 4. Allocate memory buffer of size equal to chunkSize
    std::vector<char> buffer(chunkSize);
    std::size_t chunkIndex = 0;
    std::size_t totalBytesProcessed = 0;

    std::cout << "Starting chunking process..." << std::endl;
    std::cout << "Input File       : " << inputFile << std::endl;
    std::cout << "Output Directory : " << (outputDirectory.empty() ? "." : outputDirectory) << std::endl;
    std::cout << "Chunk Size       : " << chunkSize << " bytes (" 
              << std::fixed << std::setprecision(2) 
              << (static_cast<double>(chunkSize) / (1024.0 * 1024.0)) << " MB)" << std::endl;
    std::cout << "--------------------------------------------------" << std::endl;

    // 5. Incrementally read from file into buffer and write to chunk files
    while (inFile.read(buffer.data(), static_cast<std::streamsize>(chunkSize)) || inFile.gcount() > 0) {
        std::streamsize bytesRead = inFile.gcount();
        if (bytesRead <= 0) {
            break;
        }

        // Format chunk filename as chunk_0000, chunk_0001, etc.
        std::ostringstream filenameStream;
        filenameStream << "chunk_" << std::setw(4) << std::setfill('0') << chunkIndex;
        std::string chunkFilename = filenameStream.str();

        fs::path chunkFilePath = fs::path(outputDirectory) / chunkFilename;

        // Open chunk destination file in binary mode
        std::ofstream outFile(chunkFilePath, std::ios::binary | std::ios::trunc);
        if (!outFile.is_open()) {
            throw std::runtime_error("Failed to create chunk file: " + chunkFilePath.string());
        }

        // Write only the actual bytes read
        outFile.write(buffer.data(), bytesRead);
        if (!outFile) {
            throw std::runtime_error("Failed to write data to chunk file: " + chunkFilePath.string());
        }
        outFile.close();

        std::cout << "  [+] Created " << chunkFilename 
                  << " (" << bytesRead << " bytes) -> " 
                  << chunkFilePath.string() << std::endl;

        totalBytesProcessed += static_cast<std::size_t>(bytesRead);
        chunkIndex++;
    }

    inFile.close();

    // 6. Final summary
    std::cout << "--------------------------------------------------" << std::endl;
    std::cout << "Chunking completed successfully!" << std::endl;
    std::cout << "Original File Path : " << inputFile << std::endl;
    std::cout << "Chunks Created     : " << chunkIndex << std::endl;
    std::cout << "Total Bytes        : " << totalBytesProcessed << " bytes" << std::endl;
    std::cout << "Configured Size    : " << chunkSize << " bytes per chunk" << std::endl;
    std::cout << "==================================================" << std::endl;
}
