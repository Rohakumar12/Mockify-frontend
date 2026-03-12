import React, { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import socket from "./utils/socket";
import Form from "./components/Form";
import Sidebar from "./components/Sidebar";
import Editor from "@monaco-editor/react";
import Whiteboard from "./components/Whiteboard";

const App = () => {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("// Start coding here...");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState([]);
  const [showWhiteBoard, setShowWhiteBoard] = useState(false);

  const handleJoin = (roomId, userName) => {
    socket.emit("join", { roomId, userName });
    setRoomId(roomId);
    setUserName(userName);
    setJoined(true);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("codeChange", { roomId, code: newCode });
    socket.emit("typing", { roomId, userName });
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    socket.emit("languageChange", { roomId, language: newLanguage });
  };

  const handleRunCode = async () => {
    try {
      const response = await fetch(
        "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            "X-RapidAPI-Key": "f9eb67ee20mshbc9cb68f5e49379p1c234fjsne0d501c9daed",
          },
          body: JSON.stringify({
            language_id: getLanguageId(language),
            source_code: code,
            stdin: input,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setOutput(data.stdout || data.stderr || "No output produced.");
      } else {
        setOutput(`Error: ${data.message || "An error occurred while executing the code."}`);
      }
    } catch (error) {
      setOutput("An error occurred while executing the code.");
    }
  };

  const getLanguageId = (language) => {
    const languages = { javascript: 63, python: 71, java: 62, c: 50, cpp: 54 };
    return languages[language.toLowerCase()] || 63;
  };

  useEffect(() => {
    socket.on("userJoined", (roomUsers) => setUsers(roomUsers));

    socket.on("userTyping", (typingUser) => {
      setTyping((prev) => [...prev, typingUser]);
      setTimeout(
        () => setTyping((prev) => prev.filter((u) => u !== typingUser)),
        3000
      );
    });

    socket.on("codeUpdate", (newCode) => setCode(newCode));
    socket.on("languageUpdate", (newLang) => setLanguage(newLang));

    return () => {
      socket.off("userJoined");
      socket.off("userTyping");
      socket.off("codeUpdate");
      socket.off("languageUpdate");
    };
  }, [roomId]);

  return (
    <Router>
      <div className="flex min-h-screen bg-black text-white overflow-hidden">
        {!joined ? (
          <div className="w-full">
            <Form
              roomId={roomId}
              userName={userName}
              setRoomId={setRoomId}
              setUserName={setUserName}
              handleJoin={handleJoin}
            />
          </div>
        ) : (
          <div className="flex w-full h-screen overflow-hidden">
            <Sidebar
              roomId={roomId}
              users={users}
              setUsers={setUsers}
              setLanguage={handleLanguageChange}
              language={language}
              typing={typing}
              setJoined={setJoined}
              setUserName={setUserName}
              setRoomId={setRoomId}
              setCode={setCode}
              setShowWhiteBoard={setShowWhiteBoard}
              showWhiteBoard={showWhiteBoard}
              userName={userName}
              socket={socket}
            />
            <div className="flex flex-1 overflow-hidden">
              <div className="w-full p-4 flex flex-col gap-4 overflow-y-auto">
                {showWhiteBoard ? (
                  <Whiteboard socket={socket} roomId={roomId} />
                ) : (
                  <>
                    <p className="text-lg text-center mt-4">
                      Hello, <span className="font-bold">{userName}</span>! Start coding below.
                    </p>
                    <Editor
                      language={language}
                      value={code}
                      onChange={handleCodeChange}
                      theme="vs-dark"
                      options={{ minimap: { enabled: false }, fontSize: 16 }}
                      height="400px"
                    />
                    <div>
                      <p className="mb-3">Input</p>
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full p-2 mt-1 bg-gray-800 rounded-lg text-white h-auto"
                        rows="4"
                        placeholder="Enter input for your code here..."
                      />
                    </div>
                    <button
                      onClick={handleRunCode}
                      className="py-2 px-4 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-semibold shadow-lg"
                    >
                      Run Code
                    </button>
                    <p>Output</p>
                    <div
                      className="w-full p-2 mt-1 bg-gray-800 rounded-lg text-white h-auto"
                      dangerouslySetInnerHTML={{
                        __html: (output || "The output will be displayed here...").replace(/\n/g, "<br />"),
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
};

export default App;
