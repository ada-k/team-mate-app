import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from './hooks/useConsumer';
import useWebSocket from './hooks/useWebSocket';
import Sidebar from './Sidebar';
import copyIcon from '/Users/adakibet/cosmology/platform/teammate/team-mate-app/src/img/copy.png'; 
import recordIcon from '/Users/adakibet/cosmology/platform/teammate/team-mate-app/src/img/record.jpg';


function App() {
  const { sessionId, chatHistory, sendTextMessage, switchSession, sendAudioMessage } = useWebSocket();
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [sessions, setSessions] = useState<string[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);


  const handleSendMessage = () => {
    if (!activeSession) return;
    const id = uuidv4();
    sendTextMessage(id, currentMessage, activeSession);
    setCurrentMessage('');
  };


  const handleSessionClick = (sessionId: string) => {
    setActiveSession(sessionId);
    switchSession(sessionId); // Switch session in WebSocket hook
  };


  const handleCreateSession = () => {
    const newSessionId = uuidv4();
    setSessions([...sessions, newSessionId]);
    setActiveSession(newSessionId);
    switchSession(newSessionId); // Switch session in WebSocket hook
  };

return (
  <div className="chat-container flex h-screen">
    <Sidebar
      sessions={sessions}
      activeSession={activeSession}
      onSessionClick={handleSessionClick}
      onSessionClick={handleCreateSession}
      onCreateSession={handleCreateSession}

    />
    <div className="flex-1 p-4">
      <div className="flex flex-col h-full">
        <ChatWindow chatHistory={chatHistory} />
        <MessageInput
          currentMessage={currentMessage}
          setCurrentMessage={setCurrentMessage}
          handleSendMessage={handleSendMessage}
        />
      </div>
    </div>
  </div>
);
}

export default App;


interface ChatWindowProps {
chatHistory: ChatMessage[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatHistory }) => {
const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

const handleCopyClick = (messageId: string, textToCopy: string) => {
  const plainText = textToCopy.replace(/<[^>]+>/g, ''); // Remove HTML tags
  navigator.clipboard.writeText(plainText)
    .then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 1500); // Reset after 1.5 seconds
    })
    .catch(err => console.error('Failed to copy text: ', err));
};

return (
  <div className="contmax-w-3xl h-full overflow-y-auto border border-gray-300 p-5 mb-4" style={{ borderColor: "#3e414b7a" }}>
    {chatHistory.map((message) => (
      <div
        key={message.id}
        className={`mb-4 p-3 relative ${message.isUserMessage ? 'bg-[#1f44b620] self-end text-white text-sm' : 'bg-[#3e414b7a] self-start text-[#ffffff8f] text-sm'}`}
      >
        <div dangerouslySetInnerHTML={{ __html: message.textResponse || message.message }} />
        {!message.isUserMessage && (
          <button
            className={`absolute top-2 right-2 p-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-transform ${copiedMessageId === message.id ? 'scale-110' : ''}`}
            onClick={() => handleCopyClick(message.id, message.textResponse || message.message)}
          >
          <img src={copyIcon} alt="Save" className="w-4 h-4 cursor-pointer"/>

          </button>
        )}
      </div>
    ))}
  </div>
);
};


interface MessageInputProps {
currentMessage: string;
setCurrentMessage: (message: string) => void;
handleSendMessage: () => void;

}

const MessageInput: React.FC<MessageInputProps> = ({
currentMessage,
setCurrentMessage,
handleSendMessage,
handleSessionClick,
activeSession
}) => {


const [isRecording, setIsRecording] = useState(false);
const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
const mediaRecorderRef = useRef<MediaRecorder | null>(null);

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    const audioChunks: Blob[] = []; // Store audio chunks
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks);
      setRecordedAudio(audioBlob);
      handleSendAudio(audioBlob);
    };

    mediaRecorder.start();
    setIsRecording(true);
  } catch (error) {
    console.error('Error accessing microphone:', error);
    // Add error handling for the user
  }
};

const stopRecording = () => {
  if (mediaRecorderRef.current) {
    mediaRecorderRef.current.stop(); // Stop recording
    setIsRecording(false); // Update state *after* stopping
  }
};

const handleSendAudio = async () => {
  if (recordedAudio) {
    // console.log("Found recorded audio: ", recordedAudio);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Audio = reader.result as string;
      sendAudioMessage(uuidv4(), base64Audio);
    };
    reader.readAsDataURL(recordedAudio);
  }
  else {
    console.log("No recorded audio found."); 
  }

};


const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setCurrentMessage(e.target.value);
};

const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') {
    if (e.shiftKey) {
      // Handle Shift + Enter: Insert a newline character
      e.preventDefault(); // Prevent default form submission

      const target = e.target as HTMLInputElement; 
      const start = target.selectionStart || 0;
      const end = target.selectionEnd || 0;
      const value = target.value;

      setCurrentMessage(value.substring(0, start) + "\n" + value.substring(end));

      // Optionally, move the cursor to the next line
      target.selectionStart = target.selectionEnd = start + 1;
    } else {
      // Handle Enter alone: Send the message
      handleSendMessage();
    }
  }
};


return (
<div className="flex">

  
  <textarea
    type="text"
    value={currentMessage}
    onChange={handleChange}
    onKeyDown={handleKeyPress}
    placeholder="Type your prompt here..."
    className="flex-auto w-6"  // Updated input styles
    style={{ 
      backgroundColor: "#3e414b7a", 
      width: "100%", 
      color: "rgba(255, 255, 255, 0.562)", 
      fontSize: "15px", 
      borderColor: "red",
      padding: "10px 15px"
    }} // Added inline styles
  />


{!isRecording ? 
(
  // <button onClick={startRecording}
    // className="flex-auto"
  // style={{ 
  //   backgroundColor: "red",
  //     width: "10%" , 
  //     color: "rgba(255, 255, 255, 0.562)", 
  //     fontSize: "15px",

  //   borderColor: "red",
  //   padding: "10px 15px"
  //   }}
  // >
  <img src={recordIcon} onClick={startRecording}/>
  // Record Audio

  // </button>
  
) 
: 
(
  <button onClick={stopRecording}>Stop Recording</button>
)
}

{/* {transcribing && <div>Transcribing...</div>} */}

<button onClick={handleSendMessage} 
disabled={isRecording}

className="flex-auto"  // Updated button styles
style={{ 
backgroundColor: "#3e414bd7",
  width: "20%" , 
  color: "rgba(255, 255, 255, 0.562)", 
  fontSize: "15px",
borderColor: "red",
padding: "10px 15px"
}}
>Send</button>


{recordedAudio && (
      <button onClick={handleSendAudio}>Send Audio</button> 
    )}


</div>
);
};