// frontend/app/chat/page.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import 'bootstrap/dist/css/bootstrap.min.css';
import ChatComponent from '@/components/ChatComponents';

interface Message {
  senderId: string; // Thay bằng email
  receiverId: string; // Thay bằng email
  content: string;
  mediaUrl?: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [friendEmail, setFriendEmail] = useState('friend2@example.com'); // Giả định email của bạn
  const socketRef = useRef<W3CWebSocket | null>(null);
  const router = useRouter();

  const email = typeof window !== 'undefined' ? localStorage.getItem('email') : null;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  console.log('Email:', email);
  console.log('Token:', token);
  console.log('--------------------------------');

  useEffect(() => {
    // Nếu chưa login thì chuyển về login
    if (!email || !token) {
      router.push('/login');
      return;
    }

    const wsUrl = `${process.env.NEXT_PUBLIC_MESSENGER_SERVER_URL!.replace('http', 'ws')}/ws/${email}/${friendEmail}`;
    socketRef.current = new W3CWebSocket(wsUrl, token);

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

    // Fetch tin nhắn cũ
    fetch(`${process.env.NEXT_PUBLIC_MESSENGER_SERVER_URL}/messages?senderId=${email}&receiverId=${friendEmail}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          router.push('/login'); // token hết hạn thì cũng đẩy về login
        }
        return res.json();
      })
      .then((data) => setMessages(data))
      .catch(() => router.push('/login'));

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [email, friendEmail, token, router]);

  const sendMessage = (content: string) => {
    if (content.trim() && socketRef.current && email && token) {
      const message: Message = {
        senderId: email, // Sử dụng email thay vì userId
        receiverId: friendEmail, // Sử dụng email thay vì friendId
        content,
        mediaUrl: '',
      };
      socketRef.current.send(JSON.stringify(message));
    }
  };

  if (!email || !token) return null; // hoặc hiện loading tạm

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