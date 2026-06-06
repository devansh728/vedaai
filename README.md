# VedaAI — Assessment Creator Engine

VedaAI is a production-ready, high-availability backend service built for educators. It transforms reference documents, curriculum guidelines, or simple prompts into beautifully structured, academically balanced exam papers and assignments in seconds. 

By separating intense AI compilation loops from the client-facing HTTP server, the engine guarantees rock-solid reliability under heavy loads.

---

## Core Features

* **Dual-Token Authentication Layer:** Implements short-lived JWT Access Tokens combined with long-lived Refresh Tokens securely managed and rotated inside Redis.
* **Intelligent Prompt Caching:** Executes deterministic SHA-256 fingerprinting on incoming layout settings to bypass background processing and deliver sub-second responses for cached requests.
* **Multi-Stage Pipeline Ingestion:** Handles file uploads seamlessly via Multer and extracts reference context strings dynamically using a dedicated PDF parsing service.
* **Dual-Queue Background Processing:** Offloads heavy tasks into isolated BullMQ processing pipelines (`assessment-generation` and `pdf-compilation`).
* **Headless PDF Rendering:** Uses Puppeteer workers on the backend to render pixel-perfect, print-ready exam documents from AI-generated JSON models and uploads them directly to cloud storage.
* **Real-Time Synchronization:** Updates the user interface instantly using a decoupled Socket.io event architecture mapped to document workspace rooms.

---

## Architectural Topology

The system is designed around **SOLID principles**, establishing clear boundaries between incoming network adapters, core business utilities, database models, and task workers.

## The Request-to-Asset Pipeline

* **Ingestion & Hashing:** The teacher submits an assignment configuration form and optional reference files. The system runs a Zod schema validation check, strips the files into clean text string buffers, and creates a unique SHA-256 hash from the parameters.

* **Cache Verification:** The system searches Redis for the calculated hash. If found, it copies the pre-existing JSON asset, attaches it to the current user, and returns it instantly.

* **Queue Pipeline Handshake:** On a cache miss, the system logs a pending record in MongoDB and pushes the job parameters to the assessment-generation queue. The client receives an immediate response code and joins a live WebSocket room mapped to that unique task.

* **AI & Document Compilation:** 
    * **Worker A** triggers a structured output LLM engine call to capture a rigid JSON payload matching the assignment layout schema.

    * **Worker B** picks up the validated JSON payload, feeds it into a specialized HTML layout frame, and runs a headless Puppeteer browser to print a clean PDF, pushing the final asset directly to cloud storage.

* **State Delivery:** The background workers emit a success signal through the WebSocket stream. The client web app catches the data stream and instantly transitions from a loading placeholder into the finalized question viewer.

--

## Technology Stack

* **Runtime Environment:** Node.js, TypeScript, Vite, TanStack

* **Web & Network Layer:** Express.js, Socket.io (WebSockets), Axios

* **Database & Memory Caching:** MongoDB (Mongoose ODM), Redis

* **Task Ingestion Architecture:** BullMQ

* **File Saving** - Object Storage(Storj)

* **Document Parsing & Compilers:** Puppeteer, pdf-parse

## Setup Instruction

### Prerequisites
- Node.js: v20.x or higher

- npm: v10.x or higher

- MongoDB: A local instance or MongoDB Atlas URI

- Redis: A running Redis server (required for Socket.io and BullMQ workers)

- Storj APi Key

### Enviroment setup

### Dir : /backend/.env

```

PORT=5000
NODE_ENV=development
MONGO_URI=
MONGO_DB_NAME=vedaai
REDIS_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
GEMINI_API_KEY=
S3_ENDPOINT=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
S3_BUCKET_NAME=
FRONTEND_URL=
```

### Dir: /frontend/.env

```

VITE_API_URL=http://localhost:5000/api

```

## Installation and Running Guide

Follow the instructions below to set up and run the application.

## Backend Setup

Open three separate terminal windows to run the main server and its background workers.

### Terminal 1: Main Server
```bash
cd backend
npm install
npm run dev
```

### Terminal 2: Assessment Worker
```bash
cd backend
npm run worker:assessment
```

### Terminal 3: PDF Worker
```bash
cd backend
npm run worker:pdf
```

---

## Frontend Setup

Open a fourth terminal window to run the user interface.

### Terminal 4: Web Application
```bash
cd frontend/vedaai-studio
npm install
npm run dev
```


## 📂 Production Deployment Note
This project uses Nitro for SSR and is configured for deployment on Vercel (Frontend) and Render (Backend API + Background Workers).

