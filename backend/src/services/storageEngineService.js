const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

/**
 * Locate the compiled C++ storage_engine binary across possible build directories and environment variables
 */
const getStorageEngineExecutablePath = () => {
  // Check explicit environment variables first
  const envPath = process.env.STORAGE_ENGINE_PATH || process.env.STORAGE_ENGINE_EXE;
  if (envPath && fs.existsSync(envPath)) {
    return path.resolve(envPath);
  }

  const isWindows = process.platform === 'win32';
  const binaryName = isWindows ? 'storage_engine.exe' : 'storage_engine';

  // Workspace root candidates relative to this file (__dirname is backend/src/services)
  const workspaceRoot = path.resolve(__dirname, '../../..');
  const backendRoot = path.resolve(__dirname, '../..');

  const candidatePaths = [
    // Relative to workspace root
    path.join(workspaceRoot, 'storage-engine/build/Release', binaryName),
    path.join(workspaceRoot, 'storage-engine/build/Debug', binaryName),
    path.join(workspaceRoot, 'storage-engine/build', binaryName),
    path.join(workspaceRoot, 'storage-engine', binaryName),
    // Relative to current working directory
    path.resolve(process.cwd(), '../storage-engine/build/Release', binaryName),
    path.resolve(process.cwd(), '../storage-engine/build/Debug', binaryName),
    path.resolve(process.cwd(), '../storage-engine/build', binaryName),
    path.resolve(process.cwd(), 'storage-engine/build/Release', binaryName),
    path.resolve(process.cwd(), 'storage-engine/build/Debug', binaryName),
    path.resolve(process.cwd(), 'storage-engine/build', binaryName),
    path.resolve(process.cwd(), 'build/Release', binaryName),
    path.resolve(process.cwd(), 'build', binaryName),
    // Relative to backend root
    path.join(backendRoot, '../storage-engine/build/Release', binaryName),
    path.join(backendRoot, '../storage-engine/build', binaryName)
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
 * @returns {Promise<{ chunkCount: number, outputDirectory: string, chunks: Array<{ index: number, fileName: string, name: string, size: number, path: string, status: string }>, engineStdout: string }>}
 */
const splitFileWithEngine = (inputFilePath, outputDir, chunkSize = 1048576) => {
  return new Promise((resolve, reject) => {
    const exePath = getStorageEngineExecutablePath();

    if (!exePath) {
      return reject(
        new Error(
          'Storage engine could not be executed. Please verify that the C++ storage engine is built (storage-engine/build/Release/storage_engine.exe).'
        )
      );
    }

    if (!fs.existsSync(inputFilePath)) {
      return reject(new Error(`Input file does not exist at path: ${inputFilePath}`));
    }

    // Ensure output directory exists
    const resolvedOutputDir = path.resolve(outputDir);
    if (!fs.existsSync(resolvedOutputDir)) {
      fs.mkdirSync(resolvedOutputDir, { recursive: true });
    }

    const resolvedInputPath = path.resolve(inputFilePath);
    const args = ['chunk', resolvedInputPath, String(chunkSize), resolvedOutputDir];

    console.log(`[StorageEngine] Executing: "${exePath}" ${args.join(' ')}`);

    const child = execFile(
      exePath,
      args,
      {
        timeout: 60000, // 60s timeout for large files
        maxBuffer: 20 * 1024 * 1024 // 20 MB buffer
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
          const files = await fs.promises.readdir(resolvedOutputDir);
          const chunkFiles = files
            .filter((f) => f.startsWith('chunk_'))
            .sort((a, b) => {
              const numA = parseInt(a.replace('chunk_', ''), 10);
              const numB = parseInt(b.replace('chunk_', ''), 10);
              return numA - numB;
            });

          if (chunkFiles.length === 0) {
            return reject(new Error('C++ storage engine completed, but no chunk files were generated in output directory.'));
          }

          const chunksInfo = [];
          for (let i = 0; i < chunkFiles.length; i++) {
            const chunkFileName = chunkFiles[i];
            const chunkPath = path.join(resolvedOutputDir, chunkFileName);
            const stats = await fs.promises.stat(chunkPath);

            chunksInfo.push({
              index: i,
              fileName: chunkFileName,
              name: chunkFileName,
              size: stats.size,
              path: chunkPath,
              status: 'Created'
            });
          }

          console.log(`[StorageEngine] Successfully generated ${chunksInfo.length} chunks in: ${resolvedOutputDir}`);
          resolve({
            chunkCount: chunksInfo.length,
            outputDirectory: resolvedOutputDir,
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

