# AI-Powered Personal Data Vault — Complete Implementation Status & Technical Specification

**Document Version:** 2.0.0  
**Project Name:** AI-Powered Personal Data Vault (`ai-personal-data-vault`)  
**Target Audience:** Engineering Leads, Architecture Reviewers, Developers  
**Status:** In Active Development / Core Modules Operational  

---

## 1. Executive Summary

The **AI-Powered Personal Data Vault** is a secure, high-performance, distributed personal data storage and retrieval platform. It integrates a **high-throughput C++17 distributed storage engine**, a **Node.js/Express REST API backend**, a **modern React 18 dashboard**, and a **Google Gemini-powered Retrieval-Augmented Generation (RAG) semantic search engine**.

The vault enables users to:
1. **Store and partition files** into deterministic binary chunks with multi-node replication and automatic failover.
2. **Synchronize third-party cloud accounts** (Google Drive, Dropbox, Notion, GitHub, OneDrive) under a single encrypted privacy layer.
3. **Index and perform vector similarity search** across all documents using dense 768-dimensional embeddings (`text-embedding-004`) and question-answering synthesis via Gemini 1.5 Flash.
4. **Interact via a polished, responsive web application** featuring dark/light modes, keyboard shortcuts (Command Palette `Ctrl+K`), real-time storage metrics, and dynamic chunk visualization.

---

## 2. Architecture & System Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React 18 Single Page App                        │
│   (Vite, Context API, Lucide Icons, Glassmorphism, Dual Theme)         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST (JWT Bearer)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Node.js / Express Backend                         │
│  ┌───────────────────────┬──────────────────────┬────────────────────┐ │
│  │ Auth & User Subsystem │ File & Chunk Service │ AI & Vector Search │ │
│  │ (bcrypt, JWT)         │ (Multer, Exec Bridge)│ (Gemini 1.5 Flash) │ │
│  └───────────┬───────────┴──────────┬───────────┴─────────┬──────────┘ │
│              │                      │                     │            │
│              ▼                      ▼                     ▼            │
│   ┌─────────────────────┐┌─────────────────────┐┌────────────────────┐ │
│   │   MongoDB Database  ││   C++17 Executable  ││ Google Gemini API  │ │
│   │  (Users, Documents, ││  `storage_engine`   ││ (text-embedding,   │ │
│   │   Chunks, Accounts, ││ (Buffer Streaming,  ││  content synthesis)│ │
│   │   Activity Logs)    ││  Replication Nodes) ││                    │ │
│   └─────────────────────┘└──────────┬──────────┘└────────────────────┘ │
└─────────────────────────────────────┼──────────────────────────────────┘
                                      ▼
             ┌─────────────────────────────────────────────────┐
             │       Distributed Node Cluster (Local Storage)   │
             │   ┌──────────────┐┌──────────────┐┌───────────┐  │
             │   │    node_1    ││    node_2    ││  node_3   │  │
             │   │ (Chunks 0,1) ││ (Chunks 1,2) ││(Chunks 0,2│  │
             │   └──────────────┘└──────────────┘└───────────┘  │
             └─────────────────────────────────────────────────┘
```

---

## 3. Completed Implementations by Subsystem

### 3.1. C++17 Distributed Storage Engine (`storage-engine/`)

The storage engine is written in standard **C++17** with zero external runtime dependencies. It handles byte-accurate stream chunking, node cluster distribution, fault-tolerant replication, and zero-loss reassembly.

#### Key Components:
- **`Chunker.cpp` / `Chunker.h`**:
  - Implements stream-based chunking reading binary buffers up to configurable sizes (default: `1 MB` / `1,048,576 bytes`).
  - Supports non-destructive file streaming suitable for large files (GBs) with constant memory footprint.
  - Automatically calculates chunk byte ranges, filenames (`chunk_0000`, `chunk_0001`), and records chunk offsets.
- **`NodeManager.cpp` / `NodeManager.h`**:
  - Manages cluster topology (`node_1`, `node_2`, `node_3`, ...).
  - Distributes binary chunks using round-robin primary node allocation plus configurable replica offsets ($R \ge 1$, default $R=2$).
  - Validates node directory health, chunk integrity, and performs failover reads: if a primary chunk is missing or corrupt, it automatically falls back to secondary and tertiary replica nodes.
- **`Manifest.cpp` / `Manifest.h`**:
  - Custom, lightweight JSON serializer and parser built natively without external third-party libraries.
  - Emits and reads structured metadata manifests containing: `file_name`, `original_size_bytes`, `chunk_size_bytes`, `total_chunks`, `replication_factor`, and chunk-level mapping (`chunk_index`, `size_bytes`, `replica_nodes`, `checksum`).
- **`main.cpp` (CLI Interface)**:
  - `store <input_file>`: Slices, replicates across nodes, and generates JSON manifest. Supports `--json` flag to print machine-parseable output directly to stdout for process wrapping.
  - `restore <manifest.json> <output_file>`: Reconstructs original file from cluster nodes with automatic replica failover.
  - `chunk <input_file> [chunk_size] [output_dir]`: Legacy single-directory chunking mode.
  - `status`: Inspects active node cluster state, chunk distribution count, and disk consumption per node.
- **`CMakeLists.txt`**:
  - Multi-platform build definition (compatible with MSVC, GCC, and Clang) targeting C++17.
- **Automated Validation Suite (`tests/run_tests.ps1`)**:
  - 8-step test harness covering: compilation, chunking, 3-node replication, JSON schema validation, bit-for-bit file restoration, simulated single-node catastrophic failure, replica failover recovery, and status diagnostics.

---

### 3.2. Backend API & Core Services (`backend/`)

Built on **Node.js** and **Express.js**, adhering to clean MVC architecture with layered services, middlewares, and strict security isolation.

#### 1. Server & Middleware:
- **`src/server.js`**: Environment variable bootstrap via `dotenv`, MongoDB connection initialization, graceful shutdown handling.
- **`src/app.js`**: Express pipeline configured with `cors` (origin-whitelisted to frontend), `express.json()`, `express.urlencoded()`, health check endpoint (`GET /`), and modular routing.
- **`src/middleware/auth.js` (`protect`)**: JWT Bearer token authentication middleware. Decodes token payload, validates user existence in MongoDB, and attaches authenticated user entity to `req.user`. Denies unauthenticated access with 401 Unauthorized.
- **`src/middleware/upload.js`**: Multer disk-storage handler configured to stage uploaded files into temporary staging directories before passing them to the storage engine.

#### 2. Core Controllers & Routes:
- **Authentication (`authController.js` & `authRoutes.js`)**:
  - `POST /api/auth/register`: User registration with email uniqueness validation and password hashing via bcrypt (10 salt rounds).
  - `POST /api/auth/login`: User credential verification and JWT token generation (30-day expiry).
  - `GET /api/auth/me`: Fetches profile details of the currently authenticated user.
  - `PUT /api/auth/profile`: Updates user display name and profile metadata.
- **File Management & Chunking Bridge (`fileController.js` & `fileRoutes.js`)**:
  - `POST /api/files/chunk` & `POST /api/files/upload`: Accepts multipart/form-data file uploads. Passes file to `storageEngineService.js` to trigger C++ chunking or fallback chunking.
  - Creates a `Document` entity and chunk records.
  - Returns detailed response: document ID, total chunk count, output directory, and metadata for each generated chunk.
- **Activity & Auditing (`activityController.js` & `activityRoutes.js`)**:
  - `GET /api/activity`: Fetches user-scoped audit trail (logins, uploads, syncs, AI queries) with pagination and status filters.
- **User Management (`userController.js` & `userRoutes.js`)**:
  - `GET /api/users/profile`: Retrieves user profile and storage allocation summary.

---

### 3.3. Multi-Cloud Integration Subsystem (`backend/src/integrations/`)

Designed with an extensible Base Provider Pattern so all cloud services adhere to a unified lifecycle.

#### 1. Architecture:
- **`BasePlatformIntegration.js`**: Abstract base class defining required contract:
  - `getAuthorizationUrl()`
  - `handleCallback(code)`
  - `refreshAccessToken(refreshToken)`
  - `listFiles(accessToken, options)`
  - `downloadFile(accessToken, fileId)`
  - `searchFiles(accessToken, query)`

#### 2. Implementations:
- **Google Drive (`GoogleDriveIntegration.js` & `googleDriveController.js`)**:
  - **Full OAuth 2.0 Workflow**: Generates scoped Google consent URLs (`drive.readonly`, `drive.metadata.readonly`, `userinfo.profile`, `userinfo.email`).
  - **State-encoded Route Protection**: Encodes userId into base64url state parameter to prevent CSRF and correlate OAuth callbacks back to the specific user account.
  - **Token Encryption at Rest**: Access and Refresh tokens are encrypted with **AES-256-CBC** using an encryption key before persisting to `ConnectedAccount`.
  - **Google Drive File Exploration**:
    - `GET /api/integrations/google-drive/files`: Lists files/folders with folder-traversal and pagination.
    - `GET /api/integrations/google-drive/search`: Full-text search across Google Drive files.
    - `GET /api/integrations/google-drive/status`: Reports sync health and connected account identity.
    - `DELETE /api/integrations/google-drive/disconnect`: Revokes and wipes external credentials.
  - **Drive Document Ingestion (`POST /api/integrations/google-drive/retrieve`)**:
    - Downloads remote files or exports Google Docs/Sheets into text format.
    - Extracts textual contents via `documentExtractionService.js`.
    - Splits text into semantic chunks via `chunkingService.js`.
    - Embeds and indexes chunks into the vector store via `vectorStoreService.js`.
- **Skeleton Integrations**:
  - Standardized structure prepared for: **Dropbox**, **GitHub**, **Notion**, and **OneDrive**.

---

### 3.4. Semantic AI & RAG Subsystem (`backend/src/services/` & `aiController.js`)

Enables natural language question answering and semantic discovery over user files.

#### Components & Pipeline:
1. **`embeddingService.js`**:
   - Integrates Google Generative AI SDK (`@google/generative-ai`).
   - Uses `text-embedding-004` to compute high-density 768-dimensional float vectors for document chunks and user queries.
2. **`chunkingService.js`**:
   - Implements sliding window semantic text segmentation with configurable chunk size (default: 500 characters) and overlap (default: 50 characters).
   - Preserves word boundaries and paragraph continuity for optimal context windowing.
3. **`documentExtractionService.js`**:
   - Handles text extraction across plain text, markdown, JSON, and Google Docs exports.
4. **`vectorStoreService.js`**:
   - In-database vector index over `DocumentChunk` records.
   - Computes mathematical **cosine similarity** between the query embedding and document chunk embeddings.
   - **Strict Data Isolation**: Similarity query always executes on a query pre-filtered by `userId`, preventing any cross-tenant information disclosure.
5. **`aiController.js` & `aiRoutes.js` (`POST /api/ai/search`)**:
   - Receives user query: `{ query: string, source?: string, topK?: number }`.
   - Embeds query $\rightarrow$ runs vector search $\rightarrow$ selects top-$K$ most relevant chunks.
   - Injects selected context into a structured prompt directed to **Gemini 1.5 Flash**.
   - Synthesizes a factual answer with source citations (document name, chunk index, similarity score).
   - Records an `AI_SEARCH` entry into the user's `ActivityLog`.

---

### 3.5. Database Schema & Data Models (`backend/src/models/`)

Managed via Mongoose with strict schema validation and compound indexing:

| Model | Collection | Key Fields | Purpose |
|---|---|---|---|
| **User** | `users` | `name`, `email` (unique), `password` (hashed), `avatar`, `role`, `createdAt` | Vault user credentials and authentication profile. |
| **Document** | `documents` | `userId`, `source`, `sourceDocumentId`, `name`, `mimeType`, `content`, `textExtracted`, `sizeBytes`, `url` | Canonical, normalized representation of all files across all platforms. Compound index on `{ userId, source, sourceDocumentId }`. |
| **DocumentChunk** | `document_chunks` | `userId`, `source`, `documentId`, `chunkIndex`, `text`, `charStart`, `charEnd`, `embedding` (array of floats) | Semantic chunks with 768-dim embeddings used for vector similarity lookups. Indexed on `userId` and `documentId`. |
| **ConnectedAccount** | `connected_accounts` | `userId`, `provider`, `providerAccountId`, `accountEmail`, `accountName`, `_accessTokenEncrypted`, `_refreshTokenEncrypted`, `tokenExpiry`, `status`, `syncStats` | Encrypted third-party cloud credentials. Uses AES-256-CBC at-rest encryption getters/setters. |
| **ActivityLog** | `activity_logs` | `userId`, `action`, `source`, `resourceId`, `resourceName`, `status`, `metadata`, `createdAt` | Comprehensive audit logging for all user interactions, logins, uploads, and AI queries. |

---

### 3.6. Modern React Frontend (`frontend/react/`)

Developed with **React 18** and **Vite**, utilizing custom CSS variables, glassmorphic card layouts, responsive sidebar, and interactive state management.

#### 1. Core State & Application Shell:
- **`AuthContext.jsx`**: Global authentication context managing JWT lifecycle, localStorage synchronization, automatic session re-validation, user profile state, and logout cleanup.
- **`App.jsx`**: Master container managing navigation (`Dashboard`, `Files`, `Integrations`, `Activity`, `Settings`), dynamic dark/light theme switching (`data-theme`), and global modal state.
- **Keyboard Shortcuts**: System-wide listener for `Ctrl+K` / `Cmd+K` triggering the Command Palette.

#### 2. Interactive Components:
- **`Header.jsx`**:
  - Global search bar trigger.
  - Interactive theme switcher with smooth color transitions.
  - Notifications bell with live alert counter and dropdown.
  - User avatar with dropdown menu (View Profile, Account Settings, Security, Logout).
- **`Sidebar.jsx`**:
  - Responsive navigation with badge counters.
  - Storage quota progress bar reflecting used vs. allocated capacity.
  - Quick action buttons (Add Source, Storage Optimizer, Command Palette).
- **`StatCards.jsx`**:
  - High-level metric tiles: Total Storage Used, Active Cloud Sources, Total Indexed Documents, AI Queries Executed.
- **`ConnectedSources.jsx`**:
  - Integration hub showing Google Drive, Dropbox, Notion, GitHub, and OneDrive.
  - Displays sync status, active account email, file count, and last sync timestamp.
  - Includes action buttons to connect, sync, or configure each service.
- **`FileUploadModal.jsx`**:
  - Drag-and-drop file upload zone supporting multi-file staging.
  - **C++ Engine Tuning Controls**: Allows users to configure chunk size (512 KB, 1 MB, 2 MB) and replication factor before uploading.
  - Live progress indicator with simulated/real chunking animation showing chunk names, sizes, and node placements.
- **`AIAssistantWidget.jsx`**:
  - Natural language search prompt with quick suggestion chips ("Find invoices from last month", "Summarize Q3 project specs").
  - Formatted answer cards displaying generative responses with inline source citations and document links.
- **`RecentFiles.jsx`**:
  - Data table displaying recent files with file type icons, source badge, size, and timestamp.
  - Interactive action menu (download, delete, view distributed chunks).
- **`ActivityAlerts.jsx`**:
  - Chronological timeline displaying recent security and operational logs (logins, imports, indexing completed).
- **`StorageOptimizerModal.jsx`**:
  - Storage diagnostic dashboard displaying node cluster health, chunk distribution balance, and deduplication recommendations.
- **`CommandPalette.jsx`**:
  - Spotlight-style modal search bar for instant navigation, file lookups, and fast system actions.
- **Authentication Suite (`components/auth/`)**:
  - `AuthPage.jsx`: Polished login and signup view with toggleable forms, validation feedback, and feature showcase.
  - `ForgotPasswordModal.jsx`: Self-service password recovery flow.
  - `GoogleAuthModal.jsx`: Google Sign-In interaction modal.

---

## 4. Current Implementation Status Matrix

| Module / Component | Feature / Capability | Status | Notes |
|---|---|---|---|
| **C++ Storage Engine** | Stream Binary Buffer Chunking | **Completed** | Tested up to 100MB+ files. |
| **C++ Storage Engine** | Multi-Node Replication & Failover | **Completed** | Round-robin distribution with replica offset. |
| **C++ Storage Engine** | Native JSON Manifest Generation | **Completed** | Emits standard JSON for Node.js / Spring Boot. |
| **C++ Storage Engine** | File Reconstruction (`restore`) | **Completed** | Byte-for-byte fidelity verified via checksum tests. |
| **C++ Storage Engine** | Node Failure Failover | **Completed** | Recovers missing chunks from replica nodes. |
| **Backend API** | User Auth (Register, Login, JWT) | **Completed** | bcrypt hashing, 30d JWT tokens. |
| **Backend API** | Child Process Bridge to C++ Engine | **Completed** | Auto-detects binary with pure JS fallback. |
| **Backend API** | Document & Chunk Storage | **Completed** | MongoDB collections with compound indices. |
| **Backend API** | AES-256-CBC Encrypted Token Storage| **Completed** | Protects OAuth tokens at rest. |
| **Backend API** | Audit Activity Logging | **Completed** | Records all actions scoped by `userId`. |
| **Google Drive** | OAuth 2.0 Flow & State Verification | **Completed** | Secure callback handling without token exposure. |
| **Google Drive** | File List, Search, & Document Import| **Completed** | Downloads and extracts remote docs. |
| **AI Subsystem** | Semantic Embeddings Generation | **Completed** | Gemini `text-embedding-004` (768-dim). |
| **AI Subsystem** | Vector Similarity Cosine Search | **Completed** | User-scoped vector search implementation. |
| **AI Subsystem** | RAG Answer Synthesis | **Completed** | Gemini 1.5 Flash with source citations. |
| **Frontend React** | Dashboard Layout & Glassmorphic UI | **Completed** | Modern design, dark/light theme support. |
| **Frontend React** | Authentication Flow & Protected Views| **Completed** | Login, signup, password reset modals. |
| **Frontend React** | File Upload & Chunking Customizer | **Completed** | Drag-drop upload with chunk tuning controls. |
| **Frontend React** | Cloud Sources & Sync Controls | **Completed** | Cards for Google Drive, Dropbox, Notion, etc. |
| **Frontend React** | AI Search & Natural Language Query | **Completed** | Interactive query widget with citation cards. |
| **Frontend React** | Command Palette (`Ctrl+K`) | **Completed** | Fast Spotlight search across vault features. |
| **Testing** | C++ Engine PowerShell Test Suite | **Completed** | 8 automated tests passing. |
| **Testing** | Backend Auth & Upload API Tests | **Completed** | Automated test scripts in `backend/tests/`. |

---

## 5. Environment & Configuration Requirements

To run the complete ecosystem, the following environment variables are supported across modules:

### Backend Configuration (`backend/.env`):
```ini
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
MONGO_URI=mongodb://localhost:27017/ai-personal-vault

# Security
JWT_SECRET=your_jwt_secret_key_here
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef # 64-char hex

# AI & Embedding Services
GEMINI_API_KEY=your_gemini_api_key_here

# Google OAuth Integration
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/integrations/google-drive/callback

# C++ Storage Engine Path (Optional override)
STORAGE_ENGINE_PATH=../storage-engine/build/Release/storage_engine.exe
```

---

## 6. Next Scheduled Milestones & Roadmap

1. **Active Dropbox & Notion Sync Pipelines**:
   - Complete concrete OAuth token exchange and file fetchers for Dropbox and Notion using the existing `BasePlatformIntegration`.
2. **HNSW / Native Vector Indexing**:
   - Transition from in-memory cosine array calculations to MongoDB Atlas Vector Search or embedded ChromaDB/Milvus for scaling past 500,000+ chunks.
3. **Background Asynchronous Worker Queue**:
   - Introduce BullMQ or Redis-backed queue for asynchronous background processing of massive file imports and heavy PDF OCR tasks.
4. **End-to-End WebSocket Event Stream**:
   - Provide real-time socket updates for chunking progress and cloud synchronization status directly to the React dashboard.
