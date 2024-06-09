import { useCallback, useContext } from "react";
import { WebSocketContext } from "../context/webSocketContext";
import { ChatMessage } from "./useConsumer";
import { WebSocketMessage } from "./usePublisher";

/**
 * Custom hook to manage WebSocket interactions.
 * @returns WebSocket context values and functions to send messages.
 */
const useWebSocket = () => {
  const { sessionId, chatHistory, publish, updatedChatHistory } =
    useContext(WebSocketContext);

  const publishMessage = useCallback(
    (message: WebSocketMessage) => publish(message),
    [publish]
  );
  /**
   * Send a text message via WebSocket.
   * @param id - Message ID
   * @param message - Message content
   */


  const sendTextMessage = useCallback(
    (id: string, message: string) => {
      const chatMessage: ChatMessage = {
        id,
        timestamp: new Date(),
        message: message,
        isUserMessage: true,
      };
      updatedChatHistory(chatMessage);

      publishMessage({
        type: "textMessage",
        sessionId: sessionId,
        id,
        message,
      });
    },
    [publishMessage, updatedChatHistory, sessionId]
  );

  const sendAudioMessage = useCallback(
    (id: string, audioData: string) => {
      const chatMessage: ChatMessage = {
        id,
        timestamp: new Date(),
        message: "[Audio Message]",
        isUserMessage: true,
      };
      updatedChatHistory(chatMessage);
  
      publishMessage({
        type: "audioData",
        sessionId: sessionId,
        id,
        audioData,
      });
    },
    [publishMessage, updatedChatHistory, sessionId]
  );
  
  return {
    sessionId,
    chatHistory,
    sendTextMessage,
    sendAudioMessage
  };
};





export default useWebSocket;


// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useRef,
//   useState,
// } from "react";
// import io, { Socket } from "socket.io-client";
// import { ChatMessage } from "./useConsumer";
// import { WebSocketMessage } from "./usePublisher";

// interface WebSocketContextProps {
//   sessionId: string | null;
//   chatHistory: ChatMessage[];
//   publish: (message: WebSocketMessage) => void;
//   updatedChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
//   switchSession: (newSessionId: string) => void;
// }

// export const WebSocketContext = createContext<WebSocketContextProps>({
//   sessionId: null,
//   chatHistory: [],
//   publish: () => {},
//   updatedChatHistory: () => {},
//   switchSession: () => {},
// });

// export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({
//   children,
// }) => {
//   const isConnected = useRef(false);
//   const isInitialized = useRef(false);
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
//   const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

//   useEffect(() => {
//     const newSocket = io("http://0.0.0.0:6789");

//     setSocket(newSocket);

//     newSocket.on("connect", () => {
//       console.log("Connected to server");
//       isConnected.current = true;
//     });

//     // Session Initialization
//     newSocket.on("sessionInit", (data) => {
//       console.log("Session initialized:", data);
//       setActiveSessionId(data.sessionId);
//       setChatHistory(data.chatHistory || []);
//       isInitialized.current = true;
//     });

//     newSocket.on("disconnect", () => {
//       console.log("Disconnected from server");
//       isConnected.current = false;
//     });

//     return () => {
//       newSocket.close();
//     };
//   }, []); 

//   // Fetch chat history when active session changes or socket connects
//   useEffect(() => {
//     if (isConnected.current && isInitialized.current && activeSessionId) {
//       socket?.emit("sessionInit", { sessionId: activeSessionId });
//     }
//   }, [socket, isConnected, isInitialized, activeSessionId]);

//   const { publish, resendLastMessage } = usePublisher(
//     socket,
//     isConnected,
//     isInitialized
//   );
 
//   const switchSession = (newSessionId: string) => {
//     setActiveSessionId(newSessionId); // This triggers the useEffect to fetch the chat history
//   };

//   return (
//     <WebSocketContext.Provider
//       value={{
//         sessionId: activeSessionId,
//         chatHistory,
//         publish,
//         updatedChatHistory: setChatHistory, 
//         switchSession,
//       }}
//     >
//       {children}
//     </WebSocketContext.Provider>
//   );
// };

// export default useWebSocket;