import React, { useEffect, useMemo, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

const languages = [
  "Python",
  "Java",
  "C++",
  "JavaScript",
  "TypeScript",
  "SQL",
  "HTML/CSS",
  "Other",
];

const tasks = [
  "General Coding",
  "Debug Code",
  "Explain Code",
  "Optimize Code",
  "Generate Code",
  "DSA Problem",
  "Convert Code",
];

const defaultModels = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
];

const starterMessages = [
  {
    role: "assistant",
    content:
      "Hi! I’m Code Helper. Paste your code, choose a task, and tell me what you want to build or fix.",
  },
];

function App() {
  const [messages, setMessages] = useState(starterMessages);
  const [prompt, setPrompt] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("Python");
  const [task, setTask] = useState("General Coding");
  const [model, setModel] = useState(defaultModels[0]);
  const [temperature, setTemperature] = useState(0.2);
  const [models, setModels] = useState(defaultModels);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/models`)
      .then((response) => {
        if (!response.ok) throw new Error("Could not load models.");
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data.models) && data.models.length > 0) {
          setModels(data.models);
          setModel((current) =>
            data.models.includes(current) ? current : data.models[0]
          );
        }
      })
      .catch(() => {
        // The backend will still validate the selected default model.
      });
  }, []);

  const recentHistory = useMemo(
    () => messages.filter((message) => message.role === "user" || message.role === "assistant").slice(-10),
    [messages]
  );

  async function sendMessage(event) {
    event?.preventDefault();

    if (!prompt.trim() || loading) {
      return;
    }

    const newUserMessage = {
      role: "user",
      content: prompt.trim(),
    };

    setMessages((current) => [...current, newUserMessage]);
    setPrompt("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: recentHistory,
          prompt: newUserMessage.content,
          code,
          language,
          task,
          model,
          temperature,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "The backend returned an error.");
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.answer },
      ]);
    } catch (err) {
      setError(
        err.message ||
          "Could not reach the backend. Make sure FastAPI is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setMessages(starterMessages);
    setPrompt("");
    setError("");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <div className="brand">Code Helper</div>
          <div className="subtitle">
            Groq-powered coding assistant
          </div>
        </div>
        <button className="clear-button" onClick={clearChat}>
          Clear chat
        </button>
      </header>

      <main className="workspace">
        <section className="chat-panel">
          <div className="messages">
            {messages.map((message, index) => (
              <article
                key={`${message.role}-${index}`}
                className={`message ${message.role}`}
              >
                <div className="message-label">
                  {message.role === "assistant" ? "Code Helper" : "You"}
                </div>
                <div className="message-content">
                  <pre>{message.content}</pre>
                </div>
              </article>
            ))}

            {loading && (
              <article className="message assistant">
                <div className="message-label">Code Helper</div>
                <div className="message-content">
                  <span className="typing">Thinking...</span>
                </div>
              </article>
            )}
          </div>

          <form className="composer" onSubmit={sendMessage}>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Ask Code Helper anything..."
              rows={4}
              disabled={loading}
            />
            <div className="composer-footer">
              <span>
                Your API key stays on the FastAPI server.
              </span>
              <button type="submit" disabled={loading || !prompt.trim()}>
                {loading ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        </section>

        <aside className="controls-panel">
          <div className="panel-heading">
            <h2>Workspace</h2>
            <p>Configure the coding task before sending your prompt.</p>
          </div>

          <label>
            <span>Language</span>
            <select value={language} onChange={(event) => setLanguage(event.target.value)}>
              {languages.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Task</span>
            <select value={task} onChange={(event) => setTask(event.target.value)}>
              {tasks.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Groq model</span>
            <select value={model} onChange={(event) => setModel(event.target.value)}>
              {models.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Creativity: {temperature.toFixed(1)}</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(event) => setTemperature(Number(event.target.value))}
            />
          </label>

          <label className="code-label">
            <span>Code</span>
            <textarea
              className="code-input"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Paste code here..."
              spellCheck="false"
              rows={18}
            />
          </label>

          {error && <div className="error-box">{error}</div>}

          <div className="api-note">
            <strong>Architecture</strong>
            <span>React → FastAPI → Groq API</span>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
