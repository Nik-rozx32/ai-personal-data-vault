#include "Chunker.h"

#include <fstream>
#include <iostream>
#include <filesystem>
#include <vector>
#include <iomanip>
#include <sstream>
#include <stdexcept>
#include <chrono>
#include <ctime>

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
    std::error_code ec;
    if (!fs::exists(inputFile, ec)) {
        throw std::runtime_error("Input file does not exist: " + inputFile);
    }
    if (fs::is_directory(inputFile, ec)) {
        throw std::runtime_error("Input path is a directory, not a regular file: " + inputFile);
    }

    if (!outputDirectory.empty()) {
        fs::create_directories(outputDirectory, ec);
        if (ec) {
            throw std::runtime_error("Failed to create output directory '" + outputDirectory + "': " + ec.message());
        }
    }

    std::ifstream inFile(inputFile, std::ios::binary);
    if (!inFile.is_open()) {
        throw std::runtime_error("Failed to open input file for reading: " + inputFile);
    }

    std::vector<char> buffer(chunkSize);
    std::size_t chunkIndex = 0;
    std::size_t totalBytesProcessed = 0;

    std::cout << "Starting chunking process (Single Directory Mode)..." << std::endl;
    std::cout << "Input File       : " << inputFile << std::endl;
    std::cout << "Output Directory : " << (outputDirectory.empty() ? "." : outputDirectory) << std::endl;
    std::cout << "Chunk Size       : " << chunkSize << " bytes (" 
              << std::fixed << std::setprecision(2) 
              << (static_cast<double>(chunkSize) / (1024.0 * 1024.0)) << " MB)" << std::endl;
    std::cout << "--------------------------------------------------" << std::endl;

    while (inFile.read(buffer.data(), static_cast<std::streamsize>(chunkSize)) || inFile.gcount() > 0) {
        std::streamsize bytesRead = inFile.gcount();
        if (bytesRead <= 0) break;

        std::ostringstream filenameStream;
        filenameStream << "chunk_" << std::setw(4) << std::setfill('0') << chunkIndex;
        std::string chunkFilename = filenameStream.str();

        fs::path chunkFilePath = fs::path(outputDirectory) / chunkFilename;

        std::ofstream outFile(chunkFilePath, std::ios::binary | std::ios::trunc);
        if (!outFile.is_open()) {
            throw std::runtime_error("Failed to create chunk file: " + chunkFilePath.string());
        }

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

    std::cout << "--------------------------------------------------" << std::endl;
    std::cout << "Chunking completed successfully!" << std::endl;
    std::cout << "Original File Path : " << inputFile << std::endl;
    std::cout << "Chunks Created     : " << chunkIndex << std::endl;
    std::cout << "Total Bytes        : " << totalBytesProcessed << " bytes" << std::endl;
    std::cout << "Configured Size    : " << chunkSize << " bytes per chunk" << std::endl;
    std::cout << "==================================================" << std::endl;
}

static std::string getIsoTimestamp() {
    auto now = std::chrono::system_clock::now();
    std::time_t nowTime = std::chrono::system_clock::to_time_t(now);
    std::tm tmBuffer;
#if defined(_WIN32) || defined(_WIN64)
    gmtime_s(&tmBuffer, &nowTime);
#else
    gmtime_r(&nowTime, &tmBuffer);
#endif
    std::ostringstream ss;
    ss << std::put_time(&tmBuffer, "%Y-%m-%dT%H:%M:%SZ");
    return ss.str();
}

FileManifest Chunker::splitToNodes(
    NodeManager& nodeManager,
    std::size_t replicationFactor,
    const std::string& manifestOutputPath
) {
    fs::path inputPath(inputFile);
    std::error_code ec;
    if (!fs::exists(inputPath, ec)) {
        throw std::runtime_error("Input file does not exist: " + inputFile);
    }
    if (fs::is_directory(inputPath, ec)) {
        throw std::runtime_error("Input path is a directory, not a regular file: " + inputFile);
    }

    std::size_t fileSize = fs::file_size(inputPath, ec);
    std::ifstream inFile(inputFile, std::ios::binary);
    if (!inFile.is_open()) {
        throw std::runtime_error("Failed to open input file for reading: " + inputFile);
    }

    // Generate unique File ID
    auto timeEpoch = std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::system_clock::now().time_since_epoch()
    ).count();
    std::string stem = inputPath.stem().string();
    std::string sanitizedStem;
    for (char c : stem) {
        if (std::isalnum(static_cast<unsigned char>(c)) || c == '_' || c == '-') {
            sanitizedStem += c;
        } else {
            sanitizedStem += '_';
        }
    }
    std::string fileId = "vault_" + sanitizedStem + "_" + std::to_string(timeEpoch);

    FileManifest manifest;
    manifest.fileId = fileId;
    manifest.originalFilename = inputPath.filename().string();
    manifest.fileSizeBytes = fileSize;
    manifest.chunkSizeBytes = chunkSize;
    manifest.replicationFactor = replicationFactor;
    manifest.createdAt = getIsoTimestamp();

    std::vector<char> buffer(chunkSize);
    std::size_t chunkIndex = 0;
    std::size_t totalBytesProcessed = 0;

    std::cout << "Starting Multi-Node Chunking & Replication Pipeline..." << std::endl;
    std::cout << "Input File         : " << inputFile << std::endl;
    std::cout << "File ID            : " << fileId << std::endl;
    std::cout << "File Size          : " << fileSize << " bytes" << std::endl;
    std::cout << "Chunk Size         : " << chunkSize << " bytes" << std::endl;
    std::cout << "Replication Factor : " << replicationFactor << "x" << std::endl;
    std::cout << "Storage Cluster    : " << nodeManager.getNodes().size() << " nodes" << std::endl;
    std::cout << "--------------------------------------------------" << std::endl;

    while (inFile.read(buffer.data(), static_cast<std::streamsize>(chunkSize)) || inFile.gcount() > 0) {
        std::streamsize bytesRead = inFile.gcount();
        if (bytesRead <= 0) break;

        std::ostringstream filenameStream;
        filenameStream << "chunk_" << std::setw(4) << std::setfill('0') << chunkIndex;
        std::string chunkFilename = filenameStream.str();

        std::vector<std::string> storedNodes = nodeManager.storeChunk(
            chunkIndex,
            chunkFilename,
            buffer.data(),
            static_cast<std::size_t>(bytesRead),
            replicationFactor
        );

        ChunkInfo info;
        info.chunkIndex = chunkIndex;
        info.chunkName = chunkFilename;
        info.sizeBytes = static_cast<std::size_t>(bytesRead);
        info.nodes = storedNodes;
        manifest.chunks.push_back(info);

        std::cout << "  [+] " << chunkFilename << " (" << bytesRead << " bytes) -> Replicated to [";
        for (std::size_t i = 0; i < storedNodes.size(); ++i) {
            std::cout << storedNodes[i];
            if (i + 1 < storedNodes.size()) std::cout << ", ";
        }
        std::cout << "]" << std::endl;

        totalBytesProcessed += static_cast<std::size_t>(bytesRead);
        chunkIndex++;
    }

    inFile.close();
    manifest.totalChunks = chunkIndex;

    // Determine Manifest Save Path
    std::string actualManifestPath = manifestOutputPath;
    if (actualManifestPath.empty()) {
        fs::path manifestDir = "metadata/manifests";
        fs::create_directories(manifestDir, ec);
        actualManifestPath = (manifestDir / (fileId + ".json")).string();
    }

    manifest.saveToFile(actualManifestPath);

    std::cout << "--------------------------------------------------" << std::endl;
    std::cout << "Multi-Node Storage & Replication Complete!" << std::endl;
    std::cout << "Total Chunks Stored : " << manifest.totalChunks << std::endl;
    std::cout << "Total Data Bytes    : " << totalBytesProcessed << " bytes" << std::endl;
    std::cout << "Manifest Saved To   : " << actualManifestPath << std::endl;
    std::cout << "==================================================" << std::endl;

    return manifest;
}
