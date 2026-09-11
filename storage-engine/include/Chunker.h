#ifndef CHUNKER_H
#define CHUNKER_H

#include <string>
#include <cstddef>

/**
 * @brief Chunker class responsible for splitting files into fixed-size binary chunks.
 *
 * This forms Phase 1 of the AI-Powered Personal Data Vault storage engine.
 * Files are read sequentially in fixed-size buffers and saved as separate chunk files
 * without loading the entire file into memory.
 */
class Chunker {
private:
    std::string inputFile;
    std::string outputDirectory;
    std::size_t chunkSize;

public:
    // Default chunk size is 1 MB (1024 * 1024 bytes = 1,048,576 bytes)
    static constexpr std::size_t DEFAULT_CHUNK_SIZE = 1024 * 1024;

    /**
     * @brief Constructs a new Chunker object.
     *
     * @param inputFile Path to the input file to split.
     * @param outputDirectory Directory where chunks will be written (default: "chunks").
     * @param chunkSize Size of each chunk in bytes (default: 1 MB).
     */
    Chunker(
        const std::string& inputFile,
        const std::string& outputDirectory = "chunks",
        std::size_t chunkSize = DEFAULT_CHUNK_SIZE
    );

    /**
     * @brief Performs the splitting of the input file into chunks.
     *
     * Reads the file in binary mode, creates output directories if needed,
     * writes individual chunks (chunk_0000, chunk_0001, etc.), and prints
     * real-time progress and a final summary.
     */
    void split();
};

#endif // CHUNKER_H
