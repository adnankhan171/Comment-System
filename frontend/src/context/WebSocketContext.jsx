import React, { createContext, useState, useEffect, useContext } from 'react';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [lastMessage, setLastMessage] = useState(null);

    const connect = (postId) => {
        if (socket) {
            socket.close();
        }
        // Use localhost for dev, ideally this comes from env
        const wsUrl = `ws://127.0.0.1:8000/ws/${postId}`;
        console.log("Connecting to WS:", wsUrl);

        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log("WebSocket Connected");
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("WS Message:", data);
                setLastMessage(data);
            } catch (e) {
                console.error("Failed to parse WS message", e);
            }
        };

        ws.onclose = () => {
            console.log("WebSocket Disconnected");
        };

        ws.onerror = (error) => {
            console.error("WebSocket Error:", error);
        };

        setSocket(ws);
    };

    const disconnect = () => {
        if (socket) {
            socket.close();
            setSocket(null);
        }
    };

    return (
        <WebSocketContext.Provider value={{ connect, disconnect, lastMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    return useContext(WebSocketContext);
};
