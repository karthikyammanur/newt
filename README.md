<div align="center">
  <h1>📰 AI News Summarizer</h1>
  <p>Full-screen, reel-style news summary viewer with AI-powered backend and modern React frontend.</p>
  <img src="frontend/public/favicon.ico" width="64" alt="Logo" />
  <br />
  <strong>⚠️ NOTE: This project is still under active development and is not fully deployed. Some features may be incomplete or subject to change.</strong>
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

- 🧠 **AI Summarization**: Daily tech news summaries with manual generation option
- 🔐 **JWT Auth**: Secure login/register with user profiles
- � **AI Chat Assistant**: Interactive chatbot for questions about news and reading habits
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 📊 **User Dashboard**: Track reading habits and engagement
- � **Social Features**: Follow other users and build a network
- 🖥️ **Modern UI**: Tailwind CSS, Framer Motion, SPA navigation
- 📝 **API Docs**: Easy-to-use REST endpoints

---

## Architecture

```
frontend/ (React, Vite, Tailwind, Framer Motion)
  └── src/
      ├── components/
      │   ├── Layout.jsx
      │   ├── AccordionSummaryCard.jsx
      │   └── ChatModal.tsx
      ├── pages/
      │   ├── TodayPage.jsx
      │   ├── SummariesPage.jsx
      │   ├── FollowersPage.jsx
      │   └── FollowingPage.jsx
      └── context/AuthContext.jsx
backend/ (FastAPI, Python 3.12, MongoDB)
  ├── simple_server.py (mock endpoints for dev)
  ├── app/
  │   ├── api/routes.py
  │   ├── core/auth.py
  │   └── db/mongodb.py
  └── chromadb/ (vector database for AI)
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
- View today's news summaries on the home page.
- **Generate New Summaries:** Click the "Generate New Summaries" button on the Today page to manually create new content if the cron job isn't working.
- **Dashboard:** Check your reading stats and engagement metrics.
- **Social:** Follow other users and see your followers/following lists.
- **Chat Assistant:** Use the floating chat button to ask questions about news, your reading habits, or app features.

---

## API Endpoints

| Endpoint                   | Method | Description                      |
| -------------------------- | ------ | -------------------------------- |
| `/api/auth/login`          | POST   | Login (form: username, password) |
| `/api/auth/register`       | POST   | Register new user                |
| `/api/auth/me`             | GET    | Get current user info            |
| `/api/summaries/today`     | GET    | Get today's news summaries       |
| `/api/summaries/generate`  | POST   | Manually generate new summaries  |
| `/api/summaries/{id}`      | GET    | Get summary by ID                |
| `/api/summaries/{id}/read` | POST   | Mark summary as read             |
| `/api/ask-ai`              | POST   | Ask the AI assistant a question  |
| `/api/user/{id}/followers` | GET    | Get user's followers             |
| `/api/user/{id}/following` | GET    | Get users followed by a user     |
| `/api/follow/{id}`         | POST   | Follow a user                    |
| `/api/unfollow/{id}`       | POST   | Unfollow a user                  |
| `/api/dashboard`           | GET    | Get user dashboard analytics     |

---

## Development

- **Frontend:**
  - Main components in `frontend/src/components/`
  - Page components in `frontend/src/pages/`
  - Auth logic in `frontend/src/context/AuthContext.jsx`
  - Styles: Tailwind CSS, animations: Framer Motion
- **Backend:**
  - Mock server: `backend/simple_server.py` (for development without dependencies)
  - Real endpoints: `backend/app/api/routes.py`
  - Database connectors: `backend/app/db/mongodb.py`
  - AI utilities: `backend/app/utils/`
- **Manual Summary Generation:**

  - If cron job is not working, use the "Generate New Summaries" button on the Today page
  - Alternatively, run `python generate_summaries.py` from the project root

- **Test Credentials:** See [Usage](#usage)

---

## Troubleshooting

- **Backend not starting?** Ensure you are in the `backend` folder and using the correct Python environment.
- **Login/network errors?** Use the mock server (`simple_server.py`) and test credentials.
- **AI summarization not working?** Try using the "Generate New Summaries" button on the Today page or run `python generate_summaries.py` manually.
- **Chatbot not responding?** Ensure the GEMINI_API_KEY environment variable is set correctly.
- **Followers/Following pages empty?** Make sure you're logged in and the backend is running correctly.
- **CORS issues?** CORS is enabled in both the real and mock servers for local development.
- **Chat textbox issues?** If the chat closes when typing, make sure you're using the latest version with event propagation fixes.

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
