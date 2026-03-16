import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";

export default function VideoCall() {
  const [myId, setMyId] = useState("");
  const [theirId, setTheirId] = useState("");
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState("idle");
  const [incomingCall, setIncomingCall] = useState(null);

  const peerRef = useRef(null);
  const callRef = useRef(null);
  const streamRef = useRef(null);
  const myVideo = useRef(null);
  const theirVideo = useRef(null);

  useEffect(() => {
    const peer = new Peer();
    peerRef.current = peer;
    peer.on("open", (id) => {
      setMyId(id);
      setStatus("ready");
    });
    peer.on("call", (call) => {
      setIncomingCall({ call, name: call.peer.slice(0, 8) });
    });
    peer.on("error", (err) => console.error("Peer:", err));
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      peer.destroy();
    };
  }, []);

  const getCamera = async () => {
    if (streamRef.current) return true;
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = s;
      if (myVideo.current) myVideo.current.srcObject = s;
      return true;
    } catch {
      setStatus("no-camera");
      return false;
    }
  };

  const showRemote = (remoteStream) => {
    if (theirVideo.current) theirVideo.current.srcObject = remoteStream;
    setStatus("incall");
    setIncomingCall(null);
  };

  const endCall = () => {
    callRef.current?.close();
    callRef.current = null;
    if (theirVideo.current) theirVideo.current.srcObject = null;
    setStatus("ready");
  };

  const startCall = async () => {
    if (!theirId.trim() || !peerRef.current) return;
    const ok = await getCamera();
    if (!ok) return;
    setStatus("calling");
    const c = peerRef.current.call(theirId.trim(), streamRef.current);
    callRef.current = c;
    c.on("stream", showRemote);
    c.on("close", endCall);
  };

  const acceptCall = async () => {
    const ok = await getCamera();
    if (!ok) return;
    const c = incomingCall.call;
    callRef.current = c;
    c.answer(streamRef.current);
    c.on("stream", showRemote);
    c.on("close", endCall);
  };

  const declineCall = () => {
    incomingCall?.call.close();
    setIncomingCall(null);
  };

  const copyId = () => {
    navigator.clipboard.writeText(myId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-3 relative">
      {status === "no-camera" && (
        <div className="bg-red-900/40 border border-red-500/40 rounded-lg p-3 mb-2">
          <p className="text-red-400 text-xs">
            ❌ Camera/mic blocked. Allow access in browser settings and refresh.
          </p>
        </div>
      )}

      {myId && (
        <div className="bg-gray-800 rounded-lg p-3 mb-2">
          <p className="text-xs text-gray-400 mb-1 uppercase tracking-widest font-semibold">
            Your Video ID
          </p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-green-400 font-mono truncate flex-1">
              {myId}
            </p>
            <button
              onClick={copyId}
              className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-white flex-shrink-0"
            >
              {copied ? "✓" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {(status === "ready" || status === "idle") && (
        <div className="flex flex-col gap-2 mb-2">
          <input
            type="text"
            value={theirId}
            onChange={(e) => setTheirId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && startCall()}
            placeholder="Paste friend's Video ID..."
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-green-500"
          />
          <button
            onClick={startCall}
            disabled={!theirId.trim() || status === "idle"}
            className="w-full py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-semibold text-sm flex items-center justify-center gap-2"
          >
            📹 Video Call
          </button>
        </div>
      )}

      {status === "calling" && (
        <div className="w-full py-2 mb-2 bg-yellow-600 rounded-lg text-white text-sm text-center">
          📞 Calling...
          <button onClick={endCall} className="ml-3 text-xs underline">
            Cancel
          </button>
        </div>
      )}

      {/* Videos — full width, tall, clearly separated, no overlap */}
      {status === "incall" && (
        <div className="flex flex-col gap-2 mb-2">
          {/* Remote */}
          <div className="w-full rounded-lg overflow-hidden bg-black border border-gray-600">
            <div className="px-2 py-1 bg-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block"></span>
              <span className="text-xs text-white font-semibold">Remote</span>
            </div>
            <video
              ref={theirVideo}
              autoPlay
              playsInline
              style={{
                width: "100%",
                height: "160px",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>

          {/* You */}
          <div className="w-full rounded-lg overflow-hidden bg-black border border-gray-600">
            <div className="px-2 py-1 bg-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
              <span className="text-xs text-white font-semibold">You</span>
            </div>
            <video
              ref={myVideo}
              autoPlay
              muted
              playsInline
              style={{
                width: "100%",
                height: "160px",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        </div>
      )}

      {status === "incall" && (
        <button
          onClick={endCall}
          className="w-full py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white font-semibold text-sm"
        >
          📵 End Call
        </button>
      )}

      {incomingCall && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <div className="bg-gray-800 border border-gray-600 rounded-xl p-5 text-center shadow-2xl">
            <div className="text-3xl mb-2 animate-bounce">📞</div>
            <p className="text-white font-semibold text-sm">
              Incoming video call
            </p>
            <p className="text-gray-400 text-xs mt-1 mb-4 font-mono">
              {incomingCall.name}...
            </p>
            <div className="flex gap-2">
              <button
                onClick={declineCall}
                className="flex-1 bg-red-500/20 border border-red-500/50 text-red-400 text-xs font-semibold rounded-lg py-2"
              >
                Decline
              </button>
              <button
                onClick={acceptCall}
                className="flex-1 bg-green-500/20 border border-green-500/50 text-green-400 text-xs font-semibold rounded-lg py-2"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
