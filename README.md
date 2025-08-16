
<h1 align="center">newt</h1>

<p align="center">
Newt is a modern web application that delivers daily tech news summaries in an engaging, full-screen reel-style format similar to YouTube Shorts or Instagram Reels. Built for busy professionals and tech enthusiasts, Newt uses AI-powered summarization to help you stay informed about the latest technology developments without the information overload. Instead of browsing multiple news sources and spending hours reading articles, users can catch up on everything important in just a few minutes with personalized AI-curated summaries.
</p>

<p align="center">
  <strong>⚠️ NOTE: This project is currently in active development and preparing for launch. Some features may be incomplete or subject to change.</strong>
</p>

## Tech Stack ⚙️

<details>
  
**<summary>Frontend</summary>**

- **React with Vite**: Core JavaScript library for building the user interface, with Vite providing lightning-fast development and optimized production builds.
- **Tailwind CSS**: Utility-first CSS framework for rapid, responsive UI development with custom animations and modern design patterns.
- **Framer Motion**: Advanced animation library for smooth transitions, scroll-triggered animations, and interactive UI elements.
- **React Router DOM**: Client-side routing solution enabling seamless navigation between pages and protected routes.
- **React Query**: Powerful data fetching and caching library for efficient API state management and real-time updates.
- **Chart.js**: Interactive charting library for visualizing user analytics, reading patterns, and engagement metrics.

</details>

<details>
  
**<summary>Backend</summary>**

- **FastAPI**: Modern Python web framework for building high-performance REST APIs with automatic documentation generation.
- **Python 3.12**: Latest Python runtime providing robust backend logic and AI integration capabilities.
- **SQLite**: Lightweight relational database for development with planned MongoDB migration for production scaling.
- **ChromaDB**: Vector database for storing and querying AI-generated content embeddings and semantic search functionality.
- **JWT Authentication**: Secure token-based authentication system for user management and session handling.

</details>

<details style="padding-bottom: 2rem">
  
**<summary>AI & External APIs</summary>**

- **Google Gemini API**: Advanced AI model powering intelligent news summarization and the interactive chat assistant feature.
- **News Aggregation APIs**: Multiple news sources integrated for comprehensive tech news coverage and real-time updates.
- **Vector Search**: Semantic similarity search for content recommendations and personalized news discovery.

</details>

## Setup 🚀

Follow these steps to set up the project locally:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/karthikyammanur/newt.git
   cd ai-news-summarizer
   ```

2. **Frontend Setup:**

   ```bash
   cd frontend
   npm install
   ```

3. **Backend Setup:**

   ```bash
   cd ../backend
   python -m venv venv_backend
   # On Windows:
   venv_backend\Scripts\activate
   # On macOS/Linux:
   source venv_backend/bin/activate
   pip install fastapi uvicorn python-multipart python-dotenv
   ```

4. **Environment Configuration:**

   ```bash
   # Create .env file in backend directory
   echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env
   ```

5. **Start the Backend:**

   ```bash
   cd backend
   python simple_server.py
   ```

6. **Start the Frontend (in a new terminal):**

   ```bash
   cd frontend
   npm run dev
   ```

7. **Open the app:**
   - Visit `http://localhost:5173` in your browser
   - Backend API runs on `http://localhost:8000`

> **Note:** Make sure you have Node.js (v18+) and Python 3.12+ installed. For development, the mock server provides test data without requiring external APIs.

## Current Features ✨

- 🤖 **AI-Powered Summarization**: Daily tech news summaries generated using advanced AI models with manual refresh capabilities
- 🔐 **Secure Authentication**: JWT-based user management with protected routes and session handling
- 📊 **Analytics Dashboard**: Comprehensive reading statistics, streak tracking, and personalized insights
- 🧠 **AI Chat Assistant**: Interactive chatbot for clarifying summaries and exploring topics in depth
- 🌐 **Social Features**: Follow system, user discovery, and community engagement tools
- 📱 **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- 🎨 **Modern UI/UX**: Smooth animations, dark theme, and accessibility-first design principles

## Future Goals 🥅

- **Real-time Notifications**: Push notifications for breaking tech news and personalized content alerts
- **Advanced Personalization**: Machine learning-powered content recommendations based on reading history and preferences
- **Multi-language Support**: Expanded language options for global tech news consumption
- **API Integrations**: Connect with popular productivity tools like Slack, Discord, and calendar applications
- **Premium Features**: Enhanced analytics, custom news sources, and advanced AI chat capabilities
- **Mobile App**: Native iOS and Android applications for on-the-go news consumption
- **Daily Newsletter**: A neatly formatted, daily tech newsletter that users can subscribe for

## What Makes Newt Different 🏆

Newt revolutionizes how busy professionals consume tech news by addressing the common pain points of information overload and time constraints:

- **Instant Comprehension**: Get the gist of complex tech developments in under 30 seconds per story
- **Zero Information Overload**: AI filters and summarizes only the most relevant and impactful tech news
- **Engaging Format**: Reel-style presentation makes staying informed feel effortless and enjoyable
- **Intelligent Interaction**: Ask follow-up questions to the AI for deeper understanding without leaving the app
- **Progress Tracking**: Gamified reading streaks and analytics to build consistent learning habits
- **Community Driven**: Discover what other tech professionals are reading and build your knowledge network
- **Privacy Focused**: Your reading habits and data remain secure with no unnecessary tracking or data sharing

## Development Guide 💻

### Project Structure

```
frontend/               # React application
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Route-based page components
│   ├── context/        # React context providers
│   └── utils/          # Helper functions
backend/                # FastAPI application
├── app/
│   ├── api/           # API route handlers
│   ├── core/          # Authentication & security
│   ├── db/            # Database connectors
│   └── utils/         # AI integration utilities
└── simple_server.py   # Development mock server
```

### Test Credentials (Development)

- **Username:** `testuser`
- **Password:** `testpass`

### API Endpoints

| Endpoint               | Method | Description          |
| ---------------------- | ------ | -------------------- |
| `/api/auth/login`      | POST   | User authentication  |
| `/api/summaries/today` | GET    | Daily news summaries |
| `/api/ask-ai`          | POST   | AI chat assistant    |
| `/api/dashboard`       | GET    | User analytics       |
| `/api/follow/{id}`     | POST   | Social features      |

## Git Commands Cheatsheet 📚

| Command                               | Description                                                  |
| ------------------------------------- | ------------------------------------------------------------ |
| `git clone <repository-url>`          | Clone the repository to your local machine                   |
| `git status`                          | Show the status of changes as untracked, modified, or staged |
| `git add <file-name>`                 | Stage a specific file for commit                             |
| `git add .`                           | Stage all changed files for commit                           |
| `git commit -m "Your commit message"` | Commit staged changes with a message                         |
| `git push`                            | Push your commits to the remote repository                   |
| `git pull`                            | Fetch and merge changes from the remote repository           |
| `git checkout -b <branch-name>`       | Create and switch to a new branch                            |
| `git checkout <branch-name>`          | Switch to an existing branch                                 |
| `git branch`                          | List all local branches                                      |
| `git log --oneline -10`               | View recent commit history                                   |
| `git diff`                            | Show changes between commits and working tree                |
| `git stash`                           | Temporarily save changes that are not ready to commit        |
| `git stash pop`                       | Re-apply stashed changes                                     |
| `git merge <branch-name>`             | Merge another branch into your current branch                |

**Disclaimer:** If you want to use this app for personal use, please clone this repository and run it locally. Ensure you have the necessary API keys configured for full functionality.

---

<div align="center">
  <sub>get ready to stay ahead in tech, newt is coming</sub>
</div>
