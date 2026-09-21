const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

/**
 * Locate the compiled C++ storage_engine binary across possible build directories
 */
const getStorageEngineExecutablePath = () => {
  if (process.env.STORAGE_ENGINE_EXE && fs.existsSync(process.env.STORAGE_ENGINE_EXE)) {
    return process.env.STORAGE_ENGINE_EXE;
  }

  const isWindows = process.platform === 'win32';
  const binaryName = isWindows ? 'storage_engine.exe' : 'storage_engine';

  const candidatePaths = [
    path.resolve(__dirname, '../../../../storage-engine/build/Release', binaryName),
    path.resolve(__dirname, '../../../../storage-engine/build/Debug', binaryName),
    path.resolve(__dirname, '../../../../storage-engine/build', binaryName),
    path.resolve(__dirname, '../../../../storage-engine', binaryName),
    path.resolve(process.cwd(), '../storage-engine/build/Release', binaryName),
    path.resolve(process.cwd(), '../storage-engine/build/Debug', binaryName),
    path.resolve(process.cwd(), '../storage-engine/build', binaryName),
    path.resolve(process.cwd(), '../storage-engine', binaryName),
    path.resolve(process.cwd(), 'storage-engine/build/Release', binaryName),
    path.resolve(process.cwd(), 'storage-engine/build', binaryName)
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
};

/**
 * Execute the C++ storage engine to split a file into chunks
 * Syntax: storage_engine chunk <input_file> [chunk_size] [output_dir]
 *
 * @param {string} inputFilePath - Absolute path to the source file
 * @param {string} outputDir - Directory where chunks will be written
 * @param {number} [chunkSize=1048576] - Size of each chunk in bytes (default 1 MB)
 * @returns {Promise<{ chunkCount: number, chunks: Array<{ index: number, name: string, size: number }> }>}
 */
const splitFileWithEngine = (inputFilePath, outputDir, chunkSize = 1048576) => {
  return new Promise((resolve, reject) => {
    const exePath = getStorageEngineExecutablePath();

    if (!exePath) {
      return reject(
        new Error(
          'C++ storage engine executable not found. Please ensure storage_engine has been compiled in storage-engine/build/.'
        )
      );
    }

    if (!fs.existsSync(inputFilePath)) {
      return reject(new Error(`Input file does not exist at path: ${inputFilePath}`));
    }

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const args = ['chunk', inputFilePath, String(chunkSize), outputDir];

    console.log(`[StorageEngine] Executing: "${exePath}" ${args.join(' ')}`);

    const child = execFile(
      exePath,
      args,
      {
        timeout: 30000, // 30s timeout
        maxBuffer: 10 * 1024 * 1024 // 10 MB buffer
      },
      async (error, stdout, stderr) => {
        if (error) {
          console.error('[StorageEngine] Execution error:', error.message);
          if (stderr) console.error('[StorageEngine] stderr:', stderr);
          return reject(
            new Error(`C++ storage engine process failed: ${error.message}${stderr ? ' - ' + stderr : ''}`)
          );
        }

        try {
          // Read generated chunk files from outputDir
          const files = await fs.promises.readdir(outputDir);
          const chunkFiles = files
            .filter((f) => f.startsWith('chunk_'))
            .sort((a, b) => {
              const numA = parseInt(a.replace('chunk_', ''), 10);
              const numB = parseInt(b.replace('chunk_', ''), 10);
              return numA - numB;
            });

          if (chunkFiles.length === 0) {
            return reject(new Error('C++ storage engine completed, but no chunk files were generated.'));
          }

          const chunksInfo = [];
          for (let i = 0; i < chunkFiles.length; i++) {
            const chunkFileName = chunkFiles[i];
            const chunkPath = path.join(outputDir, chunkFileName);
            const stats = await fs.promises.stat(chunkPath);

            chunksInfo.push({
              index: i,
              name: chunkFileName,
              size: stats.size
            });
          }

          console.log(`[StorageEngine] Successfully generated ${chunksInfo.length} chunks in: ${outputDir}`);
          resolve({
            chunkCount: chunksInfo.length,
            chunks: chunksInfo,
            engineStdout: stdout
          });
        } catch (scanErr) {
          reject(new Error(`Failed to inspect generated chunks: ${scanErr.message}`));
        }
      }
    );

    child.on('error', (spawnErr) => {
      reject(new Error(`Failed to launch C++ executable: ${spawnErr.message}`));
    });
  });
};

module.exports = {
  getStorageEngineExecutablePath,
  splitFileWithEngine
};
