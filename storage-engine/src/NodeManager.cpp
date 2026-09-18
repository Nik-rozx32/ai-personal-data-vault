#include "NodeManager.h"

#include <iostream>
#include <fstream>
#include <iomanip>
#include <algorithm>
#include <stdexcept>
#include <sstream>

NodeManager::NodeManager(const std::string& baseDir)
    : baseDirectory(baseDir)
{
}

void NodeManager::addNode(const std::string& id, const std::string& path) {
    StorageNode node;
    node.id = id;
    node.path = fs::path(path);
    node.isHealthy = true;

    std::error_code ec;
    fs::create_directories(node.path, ec);
    if (ec) {
        node.isHealthy = false;
    }

    nodes.push_back(node);
}

void NodeManager::initDefaultNodes(std::size_t nodeCount) {
    nodes.clear();
    if (nodeCount == 0) nodeCount = 3;

    for (std::size_t i = 1; i <= nodeCount; ++i) {
        std::string id = "node_" + std::to_string(i);
        fs::path p = baseDirectory / id;
        addNode(id, p.string());
    }
}

std::vector<std::string> NodeManager::storeChunk(
    std::size_t chunkIndex,
    const std::string& chunkName,
    const char* data,
    std::size_t size,
    std::size_t replicationFactor
) {
    if (nodes.empty()) {
        initDefaultNodes(3);
    }

    std::size_t effectiveReplication = std::min(replicationFactor, nodes.size());
    if (effectiveReplication == 0) effectiveReplication = 1;

    std::vector<std::string> storedNodes;
    std::size_t primaryIdx = chunkIndex % nodes.size();

    for (std::size_t r = 0; r < effectiveReplication; ++r) {
        std::size_t targetIdx = (primaryIdx + r) % nodes.size();
        auto& node = nodes[targetIdx];

        std::error_code ec;
        if (!fs::exists(node.path, ec)) {
            fs::create_directories(node.path, ec);
        }

        fs::path chunkFilePath = node.path / chunkName;
        std::ofstream out(chunkFilePath, std::ios::binary | std::ios::trunc);
        if (!out.is_open()) {
            throw std::runtime_error("Failed to write chunk " + chunkName + " to node " + node.id);
        }

        out.write(data, static_cast<std::streamsize>(size));
        if (!out) {
            throw std::runtime_error("Write error for chunk " + chunkName + " on node " + node.id);
        }
        out.close();

        node.chunkCount++;
        node.totalBytes += size;
        storedNodes.push_back(node.id);
    }

    return storedNodes;
}

bool NodeManager::retrieveChunk(
    const std::string& chunkName,
    const std::vector<std::string>& candidateNodes,
    std::vector<char>& outBuffer,
    std::string* outNodeUsed
) {
    for (const auto& nodeId : candidateNodes) {
        // Find matching node
        fs::path targetDir;
        bool found = false;

        for (const auto& node : nodes) {
            if (node.id == nodeId) {
                targetDir = node.path;
                found = true;
                break;
            }
        }

        if (!found) {
            // Fallback to base directory lookup
            targetDir = baseDirectory / nodeId;
        }

        fs::path chunkPath = targetDir / chunkName;
        std::error_code ec;
        if (fs::exists(chunkPath, ec) && fs::is_regular_file(chunkPath, ec)) {
            auto fileSize = fs::file_size(chunkPath, ec);
            if (ec) continue;

            std::ifstream in(chunkPath, std::ios::binary);
            if (!in.is_open()) continue;

            outBuffer.resize(fileSize);
            in.read(outBuffer.data(), static_cast<std::streamsize>(fileSize));
            if (!in && in.gcount() != static_cast<std::streamsize>(fileSize)) {
                continue;
            }
            in.close();

            if (outNodeUsed) {
                *outNodeUsed = nodeId;
            }
            return true;
        }
    }

    return false;
}

void NodeManager::restoreFile(const FileManifest& manifest, const std::string& outputPath) {
    fs::path outPath(outputPath);
    if (outPath.has_parent_path()) {
        fs::create_directories(outPath.parent_path());
    }

    std::ofstream outFile(outPath, std::ios::binary | std::ios::trunc);
    if (!outFile.is_open()) {
        throw std::runtime_error("Failed to open output file for restoration: " + outputPath);
    }

    std::cout << "Restoring file from storage nodes..." << std::endl;
    std::cout << "Original Name    : " << manifest.originalFilename << std::endl;
    std::cout << "Total Chunks     : " << manifest.chunks.size() << std::endl;
    std::cout << "Expected Size    : " << manifest.fileSizeBytes << " bytes" << std::endl;
    std::cout << "Output File      : " << outputPath << std::endl;
    std::cout << "--------------------------------------------------" << std::endl;

    std::size_t totalBytesWritten = 0;
    std::vector<char> buffer;

    for (const auto& chunk : manifest.chunks) {
        std::string usedNode;
        bool success = retrieveChunk(chunk.chunkName, chunk.nodes, buffer, &usedNode);
        if (!success) {
            outFile.close();
            fs::remove(outPath);
            throw std::runtime_error("Data Loss Error: Failed to retrieve " + chunk.chunkName +
                                     " from all replica nodes (" + std::to_string(chunk.nodes.size()) + " nodes tried).");
        }

        outFile.write(buffer.data(), buffer.size());
        if (!outFile) {
            outFile.close();
            throw std::runtime_error("Failed to write chunk data to restored file.");
        }

        totalBytesWritten += buffer.size();
        std::cout << "  [+] Retrieved " << chunk.chunkName 
                  << " (" << buffer.size() << " bytes) from [" << usedNode << "]" << std::endl;
    }

    outFile.close();

    std::cout << "--------------------------------------------------" << std::endl;
    std::cout << "File restored successfully!" << std::endl;
    std::cout << "Total Bytes Written : " << totalBytesWritten << " bytes" << std::endl;
    std::cout << "==================================================" << std::endl;
}

std::vector<StorageNode> NodeManager::refreshStats() {
    if (nodes.empty()) {
        initDefaultNodes(3);
    }

    for (auto& node : nodes) {
        node.chunkCount = 0;
        node.totalBytes = 0;

        std::error_code ec;
        if (fs::exists(node.path, ec) && fs::is_directory(node.path, ec)) {
            node.isHealthy = true;
            for (const auto& entry : fs::directory_iterator(node.path, ec)) {
                if (entry.is_regular_file()) {
                    node.chunkCount++;
                    node.totalBytes += entry.file_size();
                }
            }
        } else {
            node.isHealthy = false;
        }
    }

    return nodes;
}

void NodeManager::printStatus(bool asJson) {
    refreshStats();

    if (asJson) {
        std::cout << "{\n  \"nodes\": [\n";
        for (std::size_t i = 0; i < nodes.size(); ++i) {
            const auto& n = nodes[i];
            std::cout << "    {\n";
            std::cout << "      \"id\": \"" << n.id << "\",\n";
            std::cout << "      \"path\": \"" << n.path.generic_string() << "\",\n";
            std::cout << "      \"isHealthy\": " << (n.isHealthy ? "true" : "false") << ",\n";
            std::cout << "      \"chunkCount\": " << n.chunkCount << ",\n";
            std::cout << "      \"totalBytes\": " << n.totalBytes << "\n";
            std::cout << "    }" << (i + 1 < nodes.size() ? "," : "") << "\n";
        }
        std::cout << "  ]\n}\n";
        return;
    }

    std::cout << "==================================================" << std::endl;
    std::cout << " Storage Cluster Nodes Status" << std::endl;
    std::cout << "==================================================" << std::endl;
    std::cout << std::left << std::setw(12) << "Node ID"
              << std::setw(10) << "Status"
              << std::setw(14) << "Chunks"
              << std::setw(16) << "Total Size"
              << "Directory Path" << std::endl;
    std::cout << "--------------------------------------------------" << std::endl;

    for (const auto& node : nodes) {
        double mb = static_cast<double>(node.totalBytes) / (1024.0 * 1024.0);
        std::ostringstream sizeStr;
        sizeStr << std::fixed << std::setprecision(2) << mb << " MB";

        std::cout << std::left << std::setw(12) << node.id
                  << std::setw(10) << (node.isHealthy ? "ONLINE" : "OFFLINE")
                  << std::setw(14) << node.chunkCount
                  << std::setw(16) << sizeStr.str()
                  << node.path.string() << std::endl;
    }
    std::cout << "==================================================" << std::endl;
}
