import React, { useState, useEffect, useRef, useCallback } from "react";
import Peer from "peerjs";

const VideoCall = () => {
  const [peerId, setPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [inCall, setInCall] = useState(false);
  const [copied, setCopied] = useState(false);

  const peerRef = useRef(null);
  const currentCall = useRef(null);
  const localStream = useRef(null);

  // These are callback refs — they fire immediately when the DOM node mounts
  const localVideoRef = useCallback(
    (node) => {
      if (node && localStream.current) {
        node.srcObject = localStream.current;
      }
    },
    [inCall],
  );

  const remoteVideoRef = useCallback(
    (node) => {
      if (node && remoteStream.current) {
        node.srcObject = remoteStream.current;
      }
    },
    [inCall],
  );

  const remoteStream = useRef(null);

  useEffect(() => {
    const peer = new Peer(undefined, {
      host: "0.peerjs.com",
      port: 443,
      secure: true,
    });

    peerRef.current = peer;

    peer.on("open", (id) => {
      setPeerId(id);
    });

    // Handle INCOMING call
    peer.on("call", async (call) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStream.current = stream;
        call.answer(stream);
        currentCall.current = call;

        call.on("stream", (remote) => {
          remoteStream.current = remote;
          setInCall(true); // triggers re-render → callback refs fire with streams ready
        });

        call.on("close", stopCall);
        call.on("error", stopCall);
      } catch (err) {
        console.error("Error answering call:", err);
        alert("Could not access camera/microphone.");
      }
    });

    peer.on("error", (err) => console.error("Peer error:", err));

    return () => peer.destroy();
  }, []);

  const startCall = async () => {
    if (!remotePeerId.trim()) return alert("Please enter a Peer ID to call.");
    if (!peerRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStream.current = stream;

      const call = peerRef.current.call(remotePeerId.trim(), stream);
      currentCall.current = call;

      call.on("stream", (remote) => {
        remoteStream.current = remote;
        setInCall(true); // triggers re-render → callback refs fire
      });

      call.on("close", stopCall);
      call.on("error", (err) => {
        console.error("Call error:", err);
        stopCall();
      });
    } catch (err) {
      console.error("Error starting call:", err);
      alert("Could not access camera/microphone. Please check permissions.");
    }
  };

  const stopCall = () => {
    currentCall.current?.close();
    currentCall.current = null;
    localStream.current?.getTracks().forEach((t) => t.stop());
    localStream.current = null;
    remoteStream.current = null;
    setInCall(false);
  };

  const copyPeerId = () => {
    navigator.clipboard.writeText(peerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-3">
      {/* Your Peer ID */}
      <div className="bg-gray-800 rounded-lg p-3 mb-2">
        <p className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-widest">
          Your Video ID
        </p>
        <div className="flex items-center gap-2">
          <p className="text-xs text-green-400 font-mono truncate flex-1">
            {peerId || "Generating..."}
          </p>
          <button
            onClick={copyPeerId}
            disabled={!peerId}
            className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-white transition-all flex-shrink-0"
          >
            {copied ? "✓" : "Copy"}
          </button>
        </div>
      </div>

      {/* Input + Call button (always visible so you can call even while viewing) */}
      {!inCall && (
        <div className="flex flex-col gap-2 mb-2">
          <input
            type="text"
            value={remotePeerId}
            onChange={(e) => setRemotePeerId(e.target.value)}
            placeholder="Enter friend's Video ID..."
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-green-500"
          />
          <button
            onClick={startCall}
            disabled={!peerId || !remotePeerId.trim()}
            className="w-full py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
            Video Call
          </button>
        </div>
      )}

      {/* Video windows — only shown when in call */}
      {inCall && (
        <>
          <div className="relative mb-2">
            {/* Remote video - big */}
            <div className="w-full h-36 bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 left-2 text-xs text-white bg-black/60 px-2 py-0.5 rounded">
                Remote
              </span>
            </div>
            {/* Local video - picture in picture */}
            <div className="absolute bottom-2 right-2 w-20 h-14 bg-gray-700 rounded-lg overflow-hidden border border-gray-600">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0.5 left-1 text-xs text-white bg-black/60 px-1 rounded">
                You
              </span>
            </div>
          </div>
          <button
            onClick={stopCall}
            className="w-full py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white font-semibold text-sm transition-all"
          >
            📵 End Call
          </button>
        </>
      )}
    </div>
  );
};

export default VideoCall;
