'use client';

import { useState, useEffect, useRef } from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import 'bootstrap/dist/css/bootstrap.min.css';
import ChatComponent from '@/components/ChatComponent';

interface Message {
  senderId: string;
  receiverId: string;
  content: string;
  mediaUrl?: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [friendId, setFriendId] = useState('2'); // Giả định friendId
  const socketRef = useRef<WebSocket | null>(null);
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!userId || !token) {
      window.location.href = '/login';
      return;
    }

    socketRef.current = new W3CWebSocket(`${process.env.MESSENGER_SERVER_URL.replace('http', 'ws')}/ws/${userId}/${friendId}`, token);

    socketRef.current.onopen = () => {
      console.log('WebSocket Connected');
    };

    socketRef.current.onmessage = (message) => {
      const data = JSON.parse(message.data as string);
      setMessages((prev) => [...prev, data]);
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket Disconnected');
    };

    fetch(`${process.env.MESSENGER_SERVER_URL}/messages?senderId=${userId}&receiverId=${friendId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setMessages(data));

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [userId, friendId, token]);

  const sendMessage = (content: string) => {
    if (content.trim() && socketRef.current && userId && token) {
      const message: Message = {
        senderId: userId,
        receiverId: friendId,
        content,
        mediaUrl: '',
      };
      socketRef.current.send(JSON.stringify(message));
    }
  };

  if (!userId || !token) return null;

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <h1 className="text-center my-4">Chat</h1>
          <ChatComponent messages={messages} onSend={sendMessage} />
        </div>
      </div>
    </div>
  );
}