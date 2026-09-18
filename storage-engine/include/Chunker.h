#ifndef CHUNKER_H
#define CHUNKER_H

#include "Manifest.h"
#include "NodeManager.h"

#include <string>
#include <cstddef>
#include <vector>

/**
 * @brief Chunker class responsible for streaming files into fixed-size binary chunks
 * and distributing them across storage nodes with replication.
 */
class Chunker {
private:
    std::string inputFile;
    std::string outputDirectory;
    std::size_t chunkSize;

public:
    // Default chunk size is 1 MB (1024 * 1024 bytes = 1,048,576 bytes)
    static constexpr std::size_t DEFAULT_CHUNK_SIZE = 1024 * 1024;
    static constexpr std::size_t DEFAULT_REPLICATION_FACTOR = 2;

    /**
     * @brief Constructs a new Chunker object.
     *
     * @param inputFile Path to the input file to split.
     * @param outputDirectory Directory for legacy chunk output (default: "chunks").
     * @param chunkSize Size of each chunk in bytes (default: 1 MB).
     */
    Chunker(
        const std::string& inputFile,
        const std::string& outputDirectory = "chunks",
        std::size_t chunkSize = DEFAULT_CHUNK_SIZE
    );

    /**
     * @brief Performs standard chunking to a single output directory (Phase 1 mode).
     */
    void split();

    /**
     * @brief Chunks the file and replicates chunks across multiple storage nodes via NodeManager.
     * 
     * @param nodeManager The node manager managing the target storage cluster.
     * @param replicationFactor Number of copies to create for each chunk across nodes (default: 2).
     * @param manifestOutputPath Optional file path where JSON manifest will be written.
     * @return FileManifest Generated metadata manifest for the stored file.
     */
    FileManifest splitToNodes(
        NodeManager& nodeManager,
        std::size_t replicationFactor = DEFAULT_REPLICATION_FACTOR,
        const std::string& manifestOutputPath = ""
    );
};

#endif // CHUNKER_H
