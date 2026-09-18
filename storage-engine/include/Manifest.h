#ifndef MANIFEST_H
#define MANIFEST_H

#include <string>
#include <vector>
#include <cstddef>

/**
 * @brief Metadata for an individual binary chunk.
 */
struct ChunkInfo {
    std::size_t chunkIndex{0};
    std::string chunkName;
    std::size_t sizeBytes{0};
    std::vector<std::string> nodes; // List of node IDs holding copies of this chunk
};

/**
 * @brief Complete metadata manifest for a stored file.
 * 
 * Designed to be serialized to and parsed from JSON by the Storage Engine
 * and external services like a Spring Boot backend.
 */
struct FileManifest {
    std::string fileId;
    std::string originalFilename;
    std::size_t fileSizeBytes{0};
    std::size_t chunkSizeBytes{0};
    std::size_t totalChunks{0};
    std::size_t replicationFactor{1};
    std::string createdAt;
    std::vector<ChunkInfo> chunks;

    /**
     * @brief Serializes the manifest into a formatted JSON string.
     */
    std::string toJson() const;

    /**
     * @brief Saves the manifest as a JSON file at the specified path.
     */
    void saveToFile(const std::string& filePath) const;

    /**
     * @brief Parses a FileManifest from a JSON string.
     */
    static FileManifest fromJson(const std::string& jsonStr);

    /**
     * @brief Loads and parses a FileManifest from a JSON file.
     */
    static FileManifest loadFromFile(const std::string& filePath);
};

#endif // MANIFEST_H
