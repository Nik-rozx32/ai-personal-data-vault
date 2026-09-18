cmake_minimum_required(VERSION 3.20)

project(StorageEngine VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

include_directories(include)

add_executable(storage_engine
    src/main.cpp
    src/Chunker.cpp
    src/NodeManager.cpp
    src/Manifest.cpp
)
