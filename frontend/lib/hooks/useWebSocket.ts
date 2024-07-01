// frontend/lib/hooks/useWebSocket.ts
import { useCallback, useEffect, useRef, useState } from "react";

const useWebSocket = (onMessage: (data: any) => void, delay: number = 5000) => {
    const url = "ws://localhost:8765";
    const ws = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const connect = useCallback(() => {
        console.log(`Attempting to connect to WebSocket: ${url}`);
        ws.current = new WebSocket(url);

        ws.current.onopen = () => {
            console.log("WebSocket connected");
            setIsConnected(true);
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(`WebSocket message received: ${JSON.stringify(data)}`);
            onMessage(data);
        };

        ws.current.onerror = (error) => {
            console.error("WebSocket error:", error);
            setIsConnected(false);
        };

        ws.current.onclose = () => {
            console.log("WebSocket disconnected");
            setIsConnected(false);
            reconnectTimeoutRef.current = setTimeout(connect, 5000); // Try to reconnect after 5 seconds
        };
    }, [onMessage]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            connect();
        }, delay); // Delay the initial connection attempt

        return () => {
            clearTimeout(timeout);
            if (ws.current) {
                ws.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [connect, delay]);

    const sendMessage = useCallback((message: any) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(message));
            console.log(`WebSocket message sent: ${JSON.stringify(message)}`);
        } else {
            console.warn("WebSocket is not open. Unable to send message");
        }
    }, []);

    return { sendMessage, isConnected };
};

export default useWebSocket;
