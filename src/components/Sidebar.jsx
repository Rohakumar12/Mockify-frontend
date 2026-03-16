import React from "react";
import PropTypes from "prop-types";
import RoomInfo from "./RoomInfo";
import UserList from "./UserList";
import LanguageSelector from "./LanguageSelector";
import LeaveRoom from "./LeaveRoom";
import VoiceChat from "./VoiceChat";
import VideoCall from "./VideoCall";

const Sidebar = ({
  roomId,
  users,
  userName,
  socket,
  language,
  setLanguage,
  typing,
  setJoined,
  setUserName,
  setRoomId,
  setCode,
  setShowWhiteBoard,
  showWhiteBoard,
}) => {
  const toggleWhiteboard = () => {
    setShowWhiteBoard((prevState) => !prevState);
  };

  return (
    <div
      className="sticky top-0 w-full sm:w-1/3 md:w-1/4 lg:w-1/5 bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white rounded-lg shadow-xl h-screen flex flex-col"
      role="complementary"
      aria-label="Sidebar Navigation"
    >
      {/* Scrollable content area — everything except Leave Room */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {/* Room Info */}
        <RoomInfo roomId={roomId} />

        {/* User List */}
        <UserList users={users} typing={typing} />

        {/* Language Selector */}
        <LanguageSelector
          language={language}
          setLanguage={setLanguage}
          roomId={roomId}
        />

        {/* Whiteboard Button */}
        <button
          onClick={toggleWhiteboard}
          className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-center font-semibold shadow-lg"
        >
          {showWhiteBoard ? "Close Whiteboard" : "Open Whiteboard"}
        </button>

        {/* Voice Call */}
        <VoiceChat roomId={roomId} userName={userName} socket={socket} />

        {/* Video Call */}
        <VideoCall />
      </div>

      {/* Leave Room — always pinned at bottom, never hidden */}
      <div className="p-4 border-t border-gray-700 flex-shrink-0">
        <LeaveRoom
          setJoined={setJoined}
          setUserName={setUserName}
          setRoomId={setRoomId}
          setCode={setCode}
          setLanguage={setLanguage}
        />
      </div>
    </div>
  );
};

Sidebar.defaultProps = {
  users: [],
  typing: null,
  language: "javascript",
};

Sidebar.propTypes = {
  roomId: PropTypes.string.isRequired,
  users: PropTypes.arrayOf(PropTypes.string),
  typing: PropTypes.arrayOf(PropTypes.string),
  language: PropTypes.string.isRequired,
  setLanguage: PropTypes.func.isRequired,
  setJoined: PropTypes.func.isRequired,
  setUserName: PropTypes.func.isRequired,
  setRoomId: PropTypes.func.isRequired,
  setCode: PropTypes.func.isRequired,
};

export default Sidebar;
