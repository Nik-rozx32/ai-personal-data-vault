#ifndef NODE_MANAGER_H
#define NODE_MANAGER_H

#include "Manifest.h"

#include <string>
#include <vector>
#include <filesystem>
#include <cstddef>

namespace fs = std::filesystem;

/**
 * @brief Represents an individual storage node.
 */
struct StorageNode {
    std::string id;
    fs::path path;
    bool isHealthy{true};
    std::size_t chunkCount{0};
    std::size_t totalBytes{0};
};

/**
 * @brief Manages a cluster of storage nodes, chunk replication, distribution, and failover retrieval.
 */
class NodeManager {
private:
    std::vector<StorageNode> nodes;
    fs::path baseDirectory;

public:
    /**
     * @brief Constructs a NodeManager with an optional base directory for simulated nodes.
     */
    explicit NodeManager(const std::string& baseDir = "nodes");

    /**
     * @brief Adds a specific node to the cluster.
     */
    void addNode(const std::string& id, const std::string& path);

    /**
     * @brief Initializes a default cluster of N nodes under the base directory.
     * @param nodeCount Number of nodes to create (default: 3 -> node_1, node_2, node_3).
     */
    void initDefaultNodes(std::size_t nodeCount = 3);

    /**
     * @brief Replicates and writes a binary chunk across multiple nodes.
     * 
     * @param chunkIndex Index of the chunk (0, 1, 2, ...).
     * @param chunkName Name of the chunk file (e.g., "chunk_0000").
     * @param data Pointer to binary chunk bytes.
     * @param size Size in bytes.
     * @param replicationFactor Number of node copies to store (default: 2).
     * @return std::vector<std::string> List of node IDs where the chunk was successfully written.
     */
    std::vector<std::string> storeChunk(
        std::size_t chunkIndex,
        const std::string& chunkName,
        const char* data,
        std::size_t size,
        std::size_t replicationFactor = 2
    );

    /**
     * @brief Retrieves a binary chunk with automatic failover across candidate replica nodes.
     * 
     * @param chunkName Name of the chunk to read.
     * @param candidateNodes List of node IDs holding copies of this chunk.
     * @param outBuffer Output vector to fill with chunk bytes.
     * @param outNodeUsed (Optional) Pointer to string to receive the ID of the node that served the chunk.
     * @return true if successfully retrieved, false otherwise.
     */
    bool retrieveChunk(
        const std::string& chunkName,
        const std::vector<std::string>& candidateNodes,
        std::vector<char>& outBuffer,
        std::string* outNodeUsed = nullptr
    );

    /**
     * @brief Restores and reconstructs the original file from distributed nodes using a manifest.
     * 
     * @param manifest The file metadata manifest.
     * @param outputPath The destination path where the reconstructed file will be written.
     */
    void restoreFile(const FileManifest& manifest, const std::string& outputPath);

    /**
     * @brief Refreshes and returns the current statistics for all registered nodes.
     */
    std::vector<StorageNode> refreshStats();

    /**
     * @brief Prints a human-readable or JSON status report of all nodes.
     */
    void printStatus(bool asJson = false);

    /**
     * @brief Gets the list of registered nodes.
     */
    const std::vector<StorageNode>& getNodes() const { return nodes; }

    /**
     * @brief Returns the base directory for nodes.
     */
    const fs::path& getBaseDirectory() const { return baseDirectory; }
};

#endif // NODE_MANAGER_H
