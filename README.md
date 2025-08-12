<p>NOTE: THIS PROJECT IS STILL IN THE PROCESS OF DEPLOYMENT. ONCE COMPLETED THIS README WILL BE UPDATED AND THE LIVE URL WILL BE VISIBLE HERE</p>

<div align="center">
<<<<<<< HEAD
  <h1>📰 AI News Summarizer</h1>
  <p>Full-stack news summary application with AI-powered backend and modern React frontend.</p>
=======
  <h1>📰 NEWT</h1>
  <p>Full-screen, news summary viewer with AI-powered backend and modern React frontend.</p>
>>>>>>> 85c4a81df51e86c9cad07eaccc8ac85d7b88f55c
  <img src="frontend/public/favicon.ico" width="64" alt="Logo" />
  
  <p><strong>⚠️ NOTICE: This project is still under active development and is not fully deployed yet.</strong></p>
</div>

---


---

## Overview

**NEWT** is a modern web application that delivers daily news summaries in a visually engaging display. It features:

- AI-powered news summarization (mocked for local dev)
- JWT-based authentication
- Responsive, animated UI with React, Vite, Tailwind CSS, and Framer Motion
- Modular FastAPI backend (mock endpoints for dev)

---

## Features

<<<<<<< HEAD
- 🧠 **AI Summarization**: Daily tech news summarized by AI
- 🔐 **JWT Auth**: Secure login/register with user profiles
- 👥 **Social Features**: Follow other users and build your network
- � **AI Chat Assistant**: Ask questions about news or your reading habits
=======
- 🧠 **AI Summarization**: (RAG Model)
- 🔐 **JWT Auth**: Secure login/register
>>>>>>> 85c4a81df51e86c9cad07eaccc8ac85d7b88f55c
- 🖥️ **Modern UI**: Tailwind CSS, Framer Motion, SPA navigation
- 📱 **Responsive**: Works on desktop and mobile
- 📝 **API Docs**: Easy-to-use REST endpoints
- 📊 **User Analytics**: Track reading habits and streaks

---

<<<<<<< HEAD
## Architecture

```
frontend/ (React, Vite, Tailwind, Framer Motion)
  └── src/
      ├── components/
      │   └── AccordionSummaryCard.jsx
      ├── pages/
      │   ├── TodayPage.jsx
      │   ├── SummariesPage.jsx
      │   └── ProfilePage.jsx
      └── context/AuthContext.jsx
backend/ (FastAPI, Python 3.12, Uvicorn, ChromaDB)
  ├── simple_server.py (mock endpoints for dev)
  ├── generate_summaries.py (manual summary generation)
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
- MongoDB for user data storage
- Google Gemini API key for AI features

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

### 3. Backend Setup

```sh
cd ../backend
python -m venv venv_backend
venv_backend\Scripts\activate  # On Windows
# For Mac/Linux: source venv_backend/bin/activate
pip install -r requirements.txt  # If available
# Or install the basic requirements:
pip install fastapi uvicorn pymongo python-multipart python-jose[cryptography] passlib bcrypt google-generativeai
```

### 4. Environment Setup

Create a `.env` file in the backend directory:

```
MONGODB_URI=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key  # For AI chat features
```

### 5. Start the Backend

For development with mock data:

```sh
cd backend
python simple_server.py
```

For full functionality:

```sh
cd backend
uvicorn app.main:app --reload
```

### 6. Start the Frontend

```sh
cd frontend
npm run dev
```

### 7. Generate Summaries (Manual)

If automatic cron job isn't working, you can manually generate summaries:

```sh
cd backend
python generate_summaries.py
```

Or use the "Generate New Summaries" button on the Today page.

---

## Usage

- Open [http://localhost:5173](http://localhost:5173) in your browser.
- Register a new account or **login with test credentials:**
  - **Username:** `testuser`
  - **Password:** `testpass`
- Browse daily news summaries on the Today page
- View your profile and analytics on the Profile page
- Follow other users to build your network
- Use the AI chat assistant to ask questions about news or your reading habits
- Manually generate new summaries if needed using the button on the Today page

---

## API Endpoints

| Endpoint                        | Method | Description                      |
| ------------------------------- | ------ | -------------------------------- |
| `/api/auth/login`               | POST   | Login (form: username, password) |
| `/api/auth/register`            | POST   | Register new user                |
| `/api/auth/me`                  | GET    | Get current user info            |
| `/api/summaries/today`          | GET    | Get today's news summaries       |
| `/api/summaries/generate`       | POST   | Manually generate new summaries  |
| `/api/summaries/{id}`           | GET    | Get summary by ID                |
| `/api/user/{user_id}/profile`   | GET    | Get user profile                 |
| `/api/user/{user_id}/followers` | GET    | Get user's followers             |
| `/api/user/{user_id}/following` | GET    | Get user's following list        |
| `/api/follow/{user_id}`         | POST   | Follow a user                    |
| `/api/unfollow/{user_id}`       | POST   | Unfollow a user                  |
| `/api/ask-ai`                   | POST   | Ask the AI chat assistant        |
| `/api/dashboard`                | GET    | Get user dashboard analytics     |

---

## Development

- **Frontend:**
  - Main components: `TodayPage.jsx`, `ProfilePage.jsx`, `FollowersPage.jsx`, `ChatModal.tsx`
  - Auth logic in `frontend/src/context/AuthContext.jsx`
  - Styles: Tailwind CSS, animations: Framer Motion
- **Backend:**
  - Mock server: `backend/simple_server.py`
  - Full API: `backend/app/api/routes.py`
  - Database: MongoDB via `backend/app/db/mongodb.py`
  - Manual summary generation: `generate_summaries.py`
- **Test Credentials:** See [Usage](#usage)

---

## Troubleshooting

- **Backend not starting?**

  - Ensure you are using the correct Python environment.
  - Check if all required packages are installed.
  - Verify MongoDB connection if using the full backend.
  - Make sure environment variables are properly set.

- **Summaries not updating?**

  - The cron job may not be working. Use the "Generate New Summaries" button on the Today page or run `python generate_summaries.py` manually.

- **Login/network errors?**

  - For development, use the mock server (`simple_server.py`) and test credentials.
  - Check that your JWT secret is properly configured.

- **AI Chat not working?**

  - Verify your GEMINI_API_KEY is correctly set in the environment variables.
  - Check if the `/api/ask-ai` endpoint is properly implemented and accessible.

- **Followers/Following pages showing errors?**

  - Ensure the MongoDB database has the proper user collections and relationships set up.
  - Verify the user authentication is working correctly.

- **CORS issues?**
  - CORS is enabled in both servers for local dev.
  - If needed, add additional allowed origins in the CORS middleware configuration.

---

## Contributing

1. Fork the repo and create a feature branch.
2. Make your changes.
3. Submit a pull request with a clear description.

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

=======
>>>>>>> 85c4a81df51e86c9cad07eaccc8ac85d7b88f55c
<div align="center">
  <p>Project Status: <strong>Under Active Development</strong></p>
  <sub>Made by Karthik Yammanur.</sub>
</div>
