# Code Helper

**Code Helper** is a full-stack coding assistant with a **React frontend**, **FastAPI backend**, and **Groq API**.

## Architecture

```text
React (Vite)
    |
    | HTTP POST /api/chat
    v
FastAPI
    |
    | Groq Python SDK
    v
Groq API
```

The Groq API key stays on the backend. It is never sent to the browser.

## Project structure

```text
Code_Helper_Groq/
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py
│   ├── .env.example
│   ├── .gitignore
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .gitignore
│   ├── index.html
│   └── package.json
│
├── .gitignore
└── README.md
```

## Requirements

Install these before starting:

- Python 3.12 or newer
- Node.js 18+ with npm
- A Groq API key

## Windows CMD setup

Open **CMD** and run these commands from the folder where you extracted the project.

### 1. Open the project

```cmd
cd Code_Helper_Groq
```

### 2. Create the Python virtual environment

```cmd
cd backend
py -m venv .venv
```

### 3. Activate the virtual environment

```cmd
call .venv\Scripts\activate.bat
```

After activation, CMD should show something similar to:

```text
(.venv) C:\...\Code_Helper_Groq\backend>
```

### 4. Upgrade pip

```cmd
python -m pip install --upgrade pip
```

### 5. Install backend dependencies

```cmd
pip install -r requirements.txt
```

### 6. Create the backend environment file

```cmd
copy .env.example .env
```

### 7. Open `.env`

```cmd
notepad .env
```

Replace:

```env
GROQ_API_KEY=your_groq_api_key_here
```

with your real Groq API key, then save and close Notepad.

**Never commit `.env` to Git.**

### 8. Start the FastAPI backend

Keep this CMD window open and run:

```cmd
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

You should see the API running at:

```text
http://127.0.0.1:8000
```

FastAPI docs are available at:

```text
http://127.0.0.1:8000/docs
```

Health check:

```text
http://127.0.0.1:8000/api/health
```

---

## Start the React frontend

Open a **second CMD window**.

### 9. Go to the frontend

```cmd
cd Code_Helper_Groq\frontend
```

If CMD is currently somewhere else, use the full path, for example:

```cmd
cd /d D:\Code_Helper_Groq\frontend
```

### 10. Install Node dependencies

```cmd
npm install
```

### 11. Start the React development server

```cmd
npm run dev
```

Vite will show a local URL, normally similar to:

```text
http://localhost:5173
```

Open that address in your browser.

---

## Run the project after the first setup

You do not need to reinstall dependencies every time.

### CMD window 1 — Backend

```cmd
cd /d D:\Code_Helper_Groq\backend
call .venv\Scripts\activate.bat
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### CMD window 2 — Frontend

```cmd
cd /d D:\Code_Helper_Groq\frontend
npm run dev
```

Then open:

```text
http://localhost:5173
```

---

## Available features

Code Helper currently supports:

- General coding questions
- Debugging code
- Step-by-step code explanations
- Code optimization
- Code generation
- DSA problem solving
- Code conversion
- Python
- Java
- C++
- JavaScript
- TypeScript
- SQL
- HTML/CSS
- Groq model selection
- Temperature/creativity control
- Conversation history
- Clear chat
- Code input panel

## Groq models

The backend currently exposes:

```text
openai/gpt-oss-120b
openai/gpt-oss-20b
```

These are Groq-supported model IDs. The model list can be updated in `backend/app/main.py` as Groq changes its model catalog.

## API endpoints

### Health

```http
GET /api/health
```

### Models

```http
GET /api/models
```

### Chat

```http
POST /api/chat
```

Example request:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "What is a Python list?"
    }
  ],
  "prompt": "Explain Python lists with an example.",
  "code": "",
  "language": "Python",
  "task": "Explain Code",
  "model": "openai/gpt-oss-120b",
  "temperature": 0.2
}
```

## Build the React frontend

From the `frontend` directory:

```cmd
npm run build
```

This creates the production build in:

```text
frontend\dist
```

You can preview the production build with:

```cmd
npm run preview
```

## Useful troubleshooting commands

### Check Python

```cmd
python --version
```

### Check pip

```cmd
python -m pip --version
```

### Check Node.js

```cmd
node --version
```

### Check npm

```cmd
npm --version
```

### Check the backend environment variable

Do not print your real key into screenshots or commits. To verify that the variable exists:

```cmd
python -c "import os; print('GROQ_API_KEY is set' if os.getenv('GROQ_API_KEY') else 'GROQ_API_KEY is NOT set')"
```

### Check FastAPI health

Open this in a browser:

```text
http://127.0.0.1:8000/api/health
```

Expected response:

```json
{"status":"ok"}
```

### Port already in use

Use another backend port:

```cmd
uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

If you do this, update `API_URL` near the top of:

```text
frontend\src\App.jsx
```

from:

```javascript
const API_URL = "http://127.0.0.1:8000";
```

to:

```javascript
const API_URL = "http://127.0.0.1:8001";
```

## Deactivate Python virtual environment

When you are finished:

```cmd
deactivate
```

## Security

The API key is read by FastAPI from:

```text
backend\.env
```

The React application only calls your FastAPI server:

```text
Browser → FastAPI → Groq
```

Do not put `GROQ_API_KEY` into React source files, `frontend/.env`, or browser-side JavaScript.

## Notes

The Groq integration uses the official Groq Python SDK and the Chat Completions API. Groq's current model documentation lists `openai/gpt-oss-120b` and `openai/gpt-oss-20b` among its supported production models. Groq's documentation also provides the Python SDK pattern used by this project.
