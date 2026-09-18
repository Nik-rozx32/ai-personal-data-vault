#include "Manifest.h"

#include <fstream>
#include <sstream>
#include <iomanip>
#include <stdexcept>
#include <filesystem>
#include <regex>
#include <iostream>

namespace fs = std::filesystem;

static std::string escapeJson(const std::string& str) {
    std::ostringstream ss;
    for (char c : str) {
        switch (c) {
            case '"': ss << "\\\""; break;
            case '\\': ss << "\\\\"; break;
            case '\b': ss << "\\b"; break;
            case '\f': ss << "\\f"; break;
            case '\n': ss << "\\n"; break;
            case '\r': ss << "\\r"; break;
            case '\t': ss << "\\t"; break;
            default:
                if (static_cast<unsigned char>(c) < 0x20) {
                    ss << "\\u" << std::hex << std::setw(4) << std::setfill('0') << static_cast<int>(c);
                } else {
                    ss << c;
                }
        }
    }
    return ss.str();
}

std::string FileManifest::toJson() const {
    std::ostringstream ss;
    ss << "{\n";
    ss << "  \"fileId\": \"" << escapeJson(fileId) << "\",\n";
    ss << "  \"originalFilename\": \"" << escapeJson(originalFilename) << "\",\n";
    ss << "  \"fileSizeBytes\": " << fileSizeBytes << ",\n";
    ss << "  \"chunkSizeBytes\": " << chunkSizeBytes << ",\n";
    ss << "  \"totalChunks\": " << totalChunks << ",\n";
    ss << "  \"replicationFactor\": " << replicationFactor << ",\n";
    ss << "  \"createdAt\": \"" << escapeJson(createdAt) << "\",\n";
    ss << "  \"chunks\": [\n";

    for (std::size_t i = 0; i < chunks.size(); ++i) {
        const auto& chunk = chunks[i];
        ss << "    {\n";
        ss << "      \"chunkIndex\": " << chunk.chunkIndex << ",\n";
        ss << "      \"chunkName\": \"" << escapeJson(chunk.chunkName) << "\",\n";
        ss << "      \"sizeBytes\": " << chunk.sizeBytes << ",\n";
        ss << "      \"nodes\": [";
        for (std::size_t j = 0; j < chunk.nodes.size(); ++j) {
            ss << "\"" << escapeJson(chunk.nodes[j]) << "\"";
            if (j + 1 < chunk.nodes.size()) ss << ", ";
        }
        ss << "]\n";
        ss << "    }";
        if (i + 1 < chunks.size()) ss << ",";
        ss << "\n";
    }

    ss << "  ]\n";
    ss << "}\n";
    return ss.str();
}

void FileManifest::saveToFile(const std::string& filePath) const {
    fs::path p(filePath);
    if (p.has_parent_path()) {
        fs::create_directories(p.parent_path());
    }
    std::ofstream out(filePath, std::ios::trunc);
    if (!out.is_open()) {
        throw std::runtime_error("Failed to open manifest file for writing: " + filePath);
    }
    out << toJson();
    out.close();
}

static std::string extractString(const std::string& json, const std::string& key) {
    std::regex re("\"" + key + "\"\\s*:\\s*\"([^\"]*)\"");
    std::smatch match;
    if (std::regex_search(json, match, re) && match.size() > 1) {
        return match[1].str();
    }
    return "";
}

static std::size_t extractSizeT(const std::string& json, const std::string& key, std::size_t defaultVal = 0) {
    std::regex re("\"" + key + "\"\\s*:\\s*([0-9]+)");
    std::smatch match;
    if (std::regex_search(json, match, re) && match.size() > 1) {
        return std::stoull(match[1].str());
    }
    return defaultVal;
}

FileManifest FileManifest::fromJson(const std::string& jsonStr) {
    FileManifest manifest;
    manifest.fileId = extractString(jsonStr, "fileId");
    manifest.originalFilename = extractString(jsonStr, "originalFilename");
    manifest.fileSizeBytes = extractSizeT(jsonStr, "fileSizeBytes");
    manifest.chunkSizeBytes = extractSizeT(jsonStr, "chunkSizeBytes");
    manifest.totalChunks = extractSizeT(jsonStr, "totalChunks");
    manifest.replicationFactor = extractSizeT(jsonStr, "replicationFactor", 1);
    manifest.createdAt = extractString(jsonStr, "createdAt");

    // Extract chunks array
    std::size_t chunksPos = jsonStr.find("\"chunks\"");
    if (chunksPos != std::string::npos) {
        std::size_t arrayStart = jsonStr.find('[', chunksPos);
        std::size_t arrayEnd = jsonStr.rfind(']');
        if (arrayStart != std::string::npos && arrayEnd != std::string::npos && arrayEnd > arrayStart) {
            std::string chunksBlock = jsonStr.substr(arrayStart + 1, arrayEnd - arrayStart - 1);
            
            // Iterate over individual chunk objects enclosed in '{' and '}'
            std::size_t objStart = 0;
            while ((objStart = chunksBlock.find('{', objStart)) != std::string::npos) {
                std::size_t objEnd = chunksBlock.find('}', objStart);
                if (objEnd == std::string::npos) break;

                std::string objStr = chunksBlock.substr(objStart, objEnd - objStart + 1);
                ChunkInfo info;
                info.chunkIndex = extractSizeT(objStr, "chunkIndex");
                info.chunkName = extractString(objStr, "chunkName");
                info.sizeBytes = extractSizeT(objStr, "sizeBytes");

                // Extract nodes array inside this chunk
                std::size_t nodesPos = objStr.find("\"nodes\"");
                if (nodesPos != std::string::npos) {
                    std::size_t nStart = objStr.find('[', nodesPos);
                    std::size_t nEnd = objStr.find(']', nodesPos);
                    if (nStart != std::string::npos && nEnd != std::string::npos && nEnd > nStart) {
                        std::string nodesStr = objStr.substr(nStart + 1, nEnd - nStart - 1);
                        std::regex nodeRegex("\"([^\"]+)\"");
                        auto words_begin = std::sregex_iterator(nodesStr.begin(), nodesStr.end(), nodeRegex);
                        auto words_end = std::sregex_iterator();
                        for (std::sregex_iterator i = words_begin; i != words_end; ++i) {
                            std::smatch m = *i;
                            info.nodes.push_back(m[1].str());
                        }
                    }
                }

                manifest.chunks.push_back(info);
                objStart = objEnd + 1;
            }
        }
    }

    return manifest;
}

FileManifest FileManifest::loadFromFile(const std::string& filePath) {
    if (!fs::exists(filePath)) {
        throw std::runtime_error("Manifest file does not exist: " + filePath);
    }
    std::ifstream in(filePath);
    if (!in.is_open()) {
        throw std::runtime_error("Failed to open manifest file for reading: " + filePath);
    }
    std::stringstream buffer;
    buffer << in.rdbuf();
    return fromJson(buffer.str());
}
