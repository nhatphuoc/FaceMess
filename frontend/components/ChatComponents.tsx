// frontend/components/ChatComponents.tsx
import React, { useState, useRef, useEffect } from 'react';
import { sendFriendRequest } from '@/lib/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Message {
  id: string;
  senderEmail: string;
  receiverEmail: string;
  content: string;
  timestamp: string;
  mediaUrl?: string;
}

interface ChatComponentProps {
  messages: Message[];
  onSend: (content: string) => void;
  isFriend: boolean; // Thêm prop isFriend
  receiverEmail: string; // Thêm prop receiverEmail để gửi yêu cầu kết bạn
}

export default function ChatComponent({ messages, onSend, isFriend, receiverEmail }: ChatComponentProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const handleSend = () => {
    if (!isFriend) {
      toast.error('Cần kết bạn để gửi tin nhắn');
      return;
    }
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  const handleAddFriend = async () => {
    if (!token) {
      toast.error('Vui lòng đăng nhập lại');
      return;
    }
    try {
      await sendFriendRequest(receiverEmail, token);
      toast.success('Đã gửi yêu cầu kết bạn');
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Không thể gửi yêu cầu kết bạn');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isFriend) {
    return (
      <div className="card">
        <ToastContainer />
        <div className="card-header bg-primary text-white">Chat</div>
        <div
          className="card-body d-flex justify-content-center align-items-center"
          style={{ height: '60vh' }}
        >
          <div className="text-center">
            <p>Cần kết bạn để có thể chat</p>
            <button className="btn btn-primary" onClick={handleAddFriend}>
              Gửi yêu cầu kết bạn
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <ToastContainer />
      <div className="card-header bg-primary text-white">Chat</div>
      <div className="card-body p-0" style={{ height: '60vh', overflowY: 'auto' }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 mb-2 rounded ${
              msg.senderEmail === localStorage.getItem('email') ? 'bg-info text-white ml-auto' : 'bg-light'
            }`}
            style={{ maxWidth: '70%', wordWrap: 'break-word' }}
          >
            <div>{msg.content}</div>
            <small className="text-muted">{new Date(msg.timestamp).toLocaleTimeString()}</small>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="card-footer">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Nhập tin nhắn..."
            disabled={!isFriend}
          />
          <button className="btn btn-primary" onClick={handleSend} disabled={!isFriend}>
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}