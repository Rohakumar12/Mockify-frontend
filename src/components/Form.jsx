import React, { useState, useEffect, useRef } from "react";

// Typewriter hook
const useTypewriter = (text, speed = 60) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!text) { setDisplayed(""); setDone(false); return; }
    setDisplayed(""); setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) { clearInterval(interval); setDone(true); }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return { displayed, done };
};

// Matrix / code rain canvas on right side
const CodeRain = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノ{}[]()<>/\\;:=+-*&%$#@!?";
    const fontSize = 13;
    let cols = Math.floor(canvas.width / fontSize);
    let drops = Array(cols).fill(1).map(() => Math.random() * -50);

    const draw = () => {
      cols = Math.floor(canvas.width / fontSize);
      if (drops.length !== cols) {
        drops = Array(cols).fill(1).map(() => Math.random() * -50);
      }
      ctx.fillStyle = "rgba(3, 7, 18, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const brightness = Math.random();
        if (brightness > 0.97) {
          ctx.fillStyle = "#ffffff";
        } else if (brightness > 0.85) {
          ctx.fillStyle = "#facc15";
        } else {
          ctx.fillStyle = `rgba(52, 211, 153, ${0.15 + brightness * 0.5})`;
        }
        ctx.font = `${fontSize}px monospace`;
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.4;
      }
    };

    const id = setInterval(draw, 40);
    return () => { clearInterval(id); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
};

const Form = ({ roomId, userName, setRoomId, setUserName, handleJoin }) => {
  const [greetingName, setGreetingName] = useState("");
  const [showGreeting, setShowGreeting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const typingTimer = useRef(null);

  const { displayed: typedGreeting, done: greetingDone } = useTypewriter(
    showGreeting && greetingName ? `Hey ${greetingName}, ready to code? ⭐` : "",
    55
  );

  useEffect(() => {
    if (typingTimer.current) clearTimeout(typingTimer.current);
    if (userName.trim().length > 0) {
      typingTimer.current = setTimeout(() => {
        setGreetingName(userName.trim());
        setShowGreeting(true);
      }, 600);
    } else {
      setShowGreeting(false);
      setGreetingName("");
    }
    return () => clearTimeout(typingTimer.current);
  }, [userName]);

  const onSubmit = (e) => {
    e.preventDefault();
    handleJoin(roomId, userName);
  };

  const generateRoomId = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://mockify-backend-ycad.onrender.com/api/generate-room-id",
      );
      const data = await response.json();
      setRoomId(data.roomId);
    } catch (error) {
      console.error("Error generating room ID:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .page {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #030712;
          display: grid;
          grid-template-columns: 1fr 1fr;
          position: relative;
          overflow: hidden;
        }

        /* ── LEFT PANEL ── */
        .left-panel {
          position: relative;
          overflow: hidden;
        }

        .left-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          filter: brightness(0.75) saturate(1.1);
        }

        .left-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            rgba(3,7,18,0) 0%,
            rgba(3,7,18,0.5) 80%,
            rgba(3,7,18,1) 100%
          );
        }

        .left-overlay-bottom {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(3,7,18,0.6) 0%,
            transparent 50%
          );
        }

        .left-badge {
          position: absolute;
          top: 2rem;
          left: 2rem;
          font-family: 'Syne', sans-serif;
          font-size: 2.8rem;
          font-weight: 800;
          background: linear-gradient(135deg, #facc15, #f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: none;
          letter-spacing: -0.02em;
        }

        .left-caption {
          position: absolute;
          bottom: 2rem;
          left: 2rem;
          right: 2rem;
        }

        .left-caption h3 {
          font-family: 'Syne', sans-serif;
          font-size: 1.25rem;
          color: #f9fafb;
          font-weight: 700;
          margin-bottom: 0.75rem;
          line-height: 1.5;
          font-style: italic;
        }

        .left-caption p {
          font-size: 0.85rem;
          color: #facc15;
          line-height: 1.5;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        /* ── RIGHT PANEL ── */
        .right-panel {
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .code-rain-wrap {
          position: absolute;
          inset: 0;
          opacity: 0.9;
        }

        .right-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 400px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Greeting */
        .greeting-wrap {
          min-height: 2rem;
          margin-bottom: 1rem;
          text-align: center;
        }

        .greeting-text {
          font-family: 'Syne', sans-serif;
          font-size: 1.45rem;
          font-weight: 700;
          background: linear-gradient(90deg, #34d399, #60a5fa, #facc15);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: fadeSlideUp 0.3s ease forwards;
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .cursor {
          display: inline-block;
          width: 2px;
          height: 0.9em;
          background: #34d399;
          margin-left: 2px;
          vertical-align: middle;
          animation: blink 0.7s step-end infinite;
        }

        @keyframes blink {
          0%,100% { opacity: 1; } 50% { opacity: 0; }
        }

        /* Card */
        .card {
          width: 100%;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 0 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(250,204,21,0.05);
          position: relative;
          overflow: hidden;
        }

        .card::before {
          content: '';
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(250,204,21,0.4), transparent);
        }

        .card-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          color: #f9fafb;
          margin-bottom: 0.2rem;
        }

        .card-sub {
          font-size: 0.78rem;
          color: #4b5563;
          margin-bottom: 1.6rem;
          letter-spacing: 0.03em;
        }

        .label {
          display: block;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 5px;
        }

        .field-wrap { margin-bottom: 1.1rem; }

        .input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(9, 14, 26, 0.9);
          border: 1.5px solid #1e293b;
          border-radius: 10px;
          color: #f9fafb;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .input::placeholder { color: #334155; }

        .input:focus {
          border-color: #facc15;
          box-shadow: 0 0 0 3px rgba(250,204,21,0.1);
        }

        .input.green:focus {
          border-color: #34d399;
          box-shadow: 0 0 0 3px rgba(52,211,153,0.1);
        }

        .gen-btn {
          float: right;
          background: none;
          border: none;
          color: #34d399;
          font-size: 0.72rem;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          padding: 3px 0;
          transition: color 0.2s;
          letter-spacing: 0.02em;
        }
        .gen-btn:hover { color: #6ee7b7; }
        .gen-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .submit-btn {
          width: 100%;
          padding: 0.85rem;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #facc15 0%, #f97316 100%);
          color: #0f172a;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 24px rgba(249,115,22,0.35);
          margin-top: 0.5rem;
          letter-spacing: 0.03em;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(249,115,22,0.45);
        }

        .bottom-hint {
          text-align: center;
          color: #1f2937;
          font-size: 0.7rem;
          margin-top: 1.2rem;
          letter-spacing: 0.05em;
        }

        /* Mobile: stack vertically */
        @media (max-width: 768px) {
          .page { grid-template-columns: 1fr; }
          .left-panel { height: 220px; }
          .left-overlay {
            background: linear-gradient(to bottom, rgba(3,7,18,0) 0%, rgba(3,7,18,1) 100%);
          }
        }
      `}</style>

      <div className="page">

        {/* ── LEFT: Image Panel ── */}
        <div className="left-panel">
          <img
            src="/Gemini_Generated_Image_zdzi46zdzi46zdzi.png"
            alt="Two developers collaborating"
            className="left-image"
            onError={(e) => {
              // fallback gradient if image not found
              e.target.style.display = 'none';
              e.target.parentElement.style.background = 'linear-gradient(135deg, #0f172a, #1e293b)';
            }}
          />
          <div className="left-overlay" />
          <div className="left-overlay-bottom" />
          <div className="left-badge">Mockify</div>
          <div className="left-caption">
            <h3>"The best solutions come from minds that code together."</h3>
            <p>— Made by Rohan Kumar</p>
          </div>
        </div>

        {/* ── RIGHT: Code Rain + Form ── */}
        <div className="right-panel">
          <div className="code-rain-wrap">
            <CodeRain />
          </div>

          <div className="right-content">
            {/* Greeting */}
            <div className="greeting-wrap">
              {showGreeting && typedGreeting && (
                <span className="greeting-text" key={greetingName}>
                  {typedGreeting}
                  {!greetingDone && <span className="cursor" />}
                </span>
              )}
            </div>

            {/* Card */}
            <div className="card">
              <div className="card-title">Join a Room</div>
              <div className="card-sub">Enter your details to start collaborating</div>

              <form onSubmit={onSubmit}>
                <div className="field-wrap">
                  <label className="label">Room ID</label>
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="input"
                    placeholder="Enter or generate a room ID"
                    required
                  />
                  <button
                    type="button"
                    onClick={generateRoomId}
                    disabled={isLoading}
                    className="gen-btn"
                  >
                    {isLoading ? "⟳ Generating..." : "✦ Generate Unique ID"}
                  </button>
                  <div style={{ clear: "both" }} />
                </div>

                <div className="field-wrap">
                  <label className="label">Username</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="input green"
                    placeholder="What should we call you?"
                    required
                  />
                </div>

                <button type="submit" className="submit-btn">
                  Join Now →
                </button>
              </form>
            </div>

            <div className="bottom-hint">
              Share your Room ID with collaborators to code together
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default Form;
