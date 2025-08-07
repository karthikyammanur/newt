<div align="center">
  <h1>📰 AI News Summarizer</h1>
  <p>Full-screen, reel-style news summary viewer with AI-powered backend and modern React frontend.</p>
  <img src="frontend/public/favicon.ico" width="64" alt="Logo" />
</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Setup & Installation](#setup--installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**AI News Summarizer** is a modern web application that delivers daily news summaries in a visually engaging, full-screen, vertically-scrollable reel format (like YouTube Shorts/Reels). It features:

- AI-powered news summarization (mocked for local dev)
- JWT-based authentication
- Responsive, animated UI with React, Vite, Tailwind CSS, and Framer Motion
- Modular FastAPI backend (mock endpoints for dev)

---

## Features

- 🔥 **Reel-Style News Viewer**: Full-screen, snap-scrolling summaries
- 🧠 **AI Summarization**: (Pluggable, currently mocked for dev)
- 🔐 **JWT Auth**: Secure login/register
- 🖥️ **Modern UI**: Tailwind CSS, Framer Motion, SPA navigation
- 📱 **Responsive**: Works on desktop and mobile
- 📝 **API Docs**: Easy-to-use REST endpoints

---

## Architecture

```
frontend/ (React, Vite, Tailwind, Framer Motion)
  └── src/
      ├── components/
      │   └── ReelViewer.jsx
      ├── pages/
      │   └── ReelsPage.jsx
      └── context/AuthContext.jsx
backend/ (FastAPI, Python 3.12, Uvicorn)
  ├── simple_server.py (mock endpoints for dev)
  └── app/
      ├── api/routes.py
      ├── core/auth.py
      └── ...
```

---

## Setup & Installation

### Prerequisites

- Node.js (v18+ recommended)
- Python 3.12+
- (Optional) MongoDB for production

### 1. Clone the Repository

```sh
git clone https://github.com/karthikyammanur/newt.git
cd ai-news-summarizer
```

### 2. Frontend Setup

```sh
cd frontend
npm install
```

### 3. Backend Setup (Mock Server for Dev)

```sh
cd ../backend
python -m venv venv_backend
venv_backend\Scripts\activate  # On Windows
pip install fastapi uvicorn python-multipart
```

### 4. Start the Backend (Mock Server)

```sh
python simple_server.py
```

### 5. Start the Frontend

```sh
cd ../frontend
npm run dev
```

---

## Usage

- Open [http://localhost:5173](http://localhost:5173) in your browser.
- **Login with test credentials:**
  - **Username:** `testuser`
  - **Password:** `testpass`
- Browse daily news summaries in the reel viewer.
- Use navigation and action buttons (Read, Sources, Share).

---

## API Endpoints (Mocked for Dev)

| Endpoint               | Method | Description                      |
| ---------------------- | ------ | -------------------------------- |
| `/api/auth/login`      | POST   | Login (form: username, password) |
| `/api/auth/me`         | GET    | Get current user info            |
| `/api/summaries/today` | GET    | Get today's news summaries       |
| `/api/summaries/{id}`  | GET    | Get summary by ID                |

---

## Development

- **Frontend:**
  - Main code in `frontend/src/components/ReelViewer.jsx` and `frontend/src/pages/ReelsPage.jsx`
  - Auth logic in `frontend/src/context/AuthContext.jsx`
  - Styles: Tailwind CSS, animations: Framer Motion
- **Backend:**
  - Mock server: `backend/simple_server.py`
  - Real endpoints: `backend/app/api/routes.py` (disabled for dev)
- **Test Credentials:** See [Usage](#usage)

---

## Troubleshooting

- **Backend not starting?** Ensure you are in the `backend` folder and using the correct Python environment.
- **Login/network errors?** Use the mock server (`simple_server.py`) and test credentials.
- **AI summarization not working?** Full AI/vector search is mocked for local dev. See code comments to enable real endpoints.
- **CORS issues?** CORS is enabled in the mock server for local dev.

---

## Contributing

1. Fork the repo and create a feature branch.
2. Make your changes (see `frontend/src/components/ReelViewer.jsx` for UI, `backend/simple_server.py` for backend).
3. Submit a pull request with a clear description.

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">
  <sub>Made with ❤️ by Karthik Yammanur and contributors.</sub>
</div>
