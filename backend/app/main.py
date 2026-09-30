import os
from typing import List, Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from pydantic import BaseModel, Field

load_dotenv()

SYSTEM_PROMPT = """
You are Code Helper, an expert coding assistant.

Help the user write, understand, debug, optimize, review, and explain software.

Guidelines:
- Give correct, practical, runnable code.
- Preserve the requested programming language unless asked to convert it.
- When debugging, identify the likely root cause first, then show the fix.
- For coding problems, explain the approach and provide time/space complexity when useful.
- Mention edge cases and common mistakes when they materially matter.
- Use fenced Markdown code blocks with the correct language tag.
- Keep explanations structured and easy to follow.
- Never reveal or invent API keys or secrets.
"""

TASK_INSTRUCTIONS = {
    "General Coding": "",
    "Debug Code": "Find the root cause, explain the error, and provide corrected code.",
    "Explain Code": "Explain the code step by step in beginner-friendly language.",
    "Optimize Code": "Improve the code for readability, performance, and maintainability. Include complexity analysis.",
    "Generate Code": "Produce a complete, runnable solution with sensible error handling.",
    "DSA Problem": "Solve the problem with an efficient algorithm, explain the approach, and provide time and space complexity.",
    "Convert Code": "Convert the supplied code to the requested language while preserving behavior.",
}

SUPPORTED_MODELS = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
]

Language = Literal[
    "Python",
    "Java",
    "C++",
    "JavaScript",
    "TypeScript",
    "SQL",
    "HTML/CSS",
    "Other",
]


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1)


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    prompt: str = Field(min_length=1)
    code: str = ""
    language: Language = "Python"
    task: str = "General Coding"
    model: str = "openai/gpt-oss-120b"
    temperature: float = Field(default=0.2, ge=0.0, le=1.0)


class ChatResponse(BaseModel):
    answer: str
    model: str


app = FastAPI(
    title="Code Helper API",
    version="1.0.0",
    description="FastAPI backend for the Groq-powered Code Helper application.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_groq_client() -> Groq:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is missing. Add it to backend/.env and restart the backend.",
        )
    return Groq(api_key=api_key)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/models")
def models():
    return {"models": SUPPORTED_MODELS}


@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    if request.model not in SUPPORTED_MODELS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported model. Choose one of: {', '.join(SUPPORTED_MODELS)}",
        )

    task_instruction = TASK_INSTRUCTIONS.get(request.task, "")

    context = [
        f"Programming language: {request.language}",
        f"Task: {request.task}",
    ]

    if task_instruction:
        context.append(f"Task instruction: {task_instruction}")

    if request.code.strip():
        context.append(
            f"User code:\n```{request.language.lower()}\n{request.code}\n```"
        )

    context.append(f"User request:\n{request.prompt}")

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    # Keep the request comfortably bounded while retaining recent context.
    for item in request.messages[-10:]:
        messages.append(
            {"role": item.role, "content": item.content}
        )

    messages.append({"role": "user", "content": "\n\n".join(context)})

    try:
        client = get_groq_client()

        completion = client.chat.completions.create(
            model=request.model,
            messages=messages,
            temperature=request.temperature,
            max_completion_tokens=4096,
        )

        answer = completion.choices[0].message.content
        if not answer:
            raise HTTPException(
                status_code=502,
                detail="Groq returned an empty response.",
            )

        return ChatResponse(answer=answer, model=request.model)

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Groq request failed: {exc}",
        ) from exc
