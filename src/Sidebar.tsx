import React, { useState, useRef, useContext, useEffect } from 'react';
import { WebSocketContext } from '/Users/adakibet/cosmology/platform/teammate/team-mate-app/src/context/webSocketContext';

import editIcon from '/Users/adakibet/cosmology/platform/teammate/team-mate-app/src/img/editing.png';
import saveIcon from '//Users/adakibet/cosmology/platform/teammate/team-mate-app/src/img/save.webp';
import logo from '/Users/adakibet/cosmology/platform/teammate/team-mate-app/src/img/logo3.jpeg';
import deleteIcon from "/Users/adakibet/cosmology/platform/teammate/team-mate-app/src/img/delete.png";



interface SidebarProps {
  sessions: string[];
  activeSession: string | null;
  onSessionClick: (sessionId: string) => void;
  onCreateSession: () => void;
  onRenameSession: (sessionId: string, newName: string) => void;
}


const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSession,
  onSessionClick,
  onCreateSession,
  onRenameSession
}) => {
  
  const [newSessionNames, setNewSessionNames] = useState<{ [sessionId: string]: string }>({});
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleRenameClick = (sessionId: string) => {
    setEditingSessionId(sessionId);
    setNewSessionNames(prev => ({
      ...prev,
      [sessionId]: sessions.find(s => s === sessionId) || ''
    }));
  };

  const { switchSession } = useContext(WebSocketContext);



  const { sessionId, publish } = useContext(WebSocketContext); 
  
  const handleSessionClick = (newSessionId: string) => {
    publish({
      category: "switchSession",
      data: {
        newSessionId: newSessionId,
        oldSessionId: sessionId
      }
    });
  };


  const handleRenameChange = (event: React.ChangeEvent<HTMLInputElement>, sessionId: string) => {
    setNewSessionNames(prev => ({
      ...prev,
      [sessionId]: event.target.value
    }));
  };

  const handleDeleteClick = (sessionId: string) => {
    if (window.confirm("Are you sure you want to delete this session?")) {
      deleteSession(sessionId);
    }
  };

  const handleRenameSave = (sessionId: string) => {
    if (newSessionNames[sessionId].trim() === '') {
      alert('Session name cannot be empty');
      return;
    }
    onRenameSession(sessionId, newSessionNames[sessionId]);
    setEditingSessionId(null);
    setNewSessionNames(prev => ({ ...prev, [sessionId]: undefined }));
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`overflow-y-auto sidebar ${isCollapsed ? 'w-16' : 'w-1/6'} bg-gray-200 p-4 transition-width duration-300`}>

      <div className={`flex flex-col items-center mb-4 ${isCollapsed ? 'hidden' : ''}`}>
        <img src={logo} alt="Logo" className="w-8 h-8 mb-2" />
        <h3 className="text-lg font-semibold" style={{ color: "rgba(255, 255, 255, 0.562)" }}>TeamMate</h3>
      </div>
  
      {/* <ul className='but'>
{sessions.map((sessionId) => (
  <li 
    key={sessionId} 
    className={`p-2 mb-2 but flex items-center ${activeSession === sessionId ? 'bg-blue-300' : 'bg-white'} cursor-pointer`}
    onClick={() => handleSessionClick(sessionId)}  // Make list item clickable
  >
    {editingSessionId === sessionId ? (
      <>
        <input
          type="text"
          value={newSessionNames[sessionId] || ''}
          onChange={(e) => handleRenameChange(e, sessionId)}
          className="but flex-1 mr-2"
          ref={inputRef}
        />
        <img src={saveIcon} alt="Save" className="w-4 h-4 cursor-pointer" onClick={() => handleRenameSave(sessionId)} />
      </>
    ) : (
      <>
        <span className="flex-1">{newSessionNames[sessionId] || sessionId}</span>
        <img src={editIcon} alt="Edit" className="w-4 h-4 cursor-pointer" onClick={() => handleRenameClick(sessionId)} />
      </>
    )}
  </li>
))}
</ul> */}



      
    </div>
  );
};




export default Sidebar;





// import React from 'react';

// interface SidebarProps {
//   sessions: string[];
//   activeSession: string | null;
//   onSessionClick: (sessionId: string) => void;
//   onCreateSession: () => void;
// }

// const Sidebar: React.FC<SidebarProps> = ({ sessions, activeSession, onSessionClick, onCreateSession }) => {
//   return (
//     <div className="sidebar w-1/6 bg-gray-200 p-4">
//       <button onClick={onCreateSession} className="w-full p-2 bg-blue-500 text-white mb-4">
//         Create New Session
//       </button>
//       <ul>
//         {sessions.map((sessionId) => (
//           <li
//             key={sessionId}
//             onClick={() => onSessionClick(sessionId)}
//             className={`p-2 mb-2 cursor-pointer ${activeSession === sessionId ? 'bg-blue-300' : 'bg-white'}`}
//           >
//             {sessionId}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default Sidebar;
