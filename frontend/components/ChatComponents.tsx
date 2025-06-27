// frontend/components/ChatComponent.tsx
import React, { useState } from 'react';

interface Message {
  senderId: string;
  receiverId: string;
  content: string;
  mediaUrl?: string;
}

interface ChatComponentProps {
  messages: Message[];
  onSend: (content: string) => void;
}

export default function ChatComponent({ messages, onSend }: ChatComponentProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <div className="card">
      <div className="card-header bg-primary text-white">Chat</div>
      <div className="card-body p-0" style={{ height: '60vh', overflowY: 'auto' }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 mb-2 rounded ${
              msg.senderId === localStorage.getItem('userId') ? 'bg-info text-white ml-auto' : 'bg-light'
            }`}
            style={{ maxWidth: '70%', wordWrap: 'break-word' }}
          >
            {msg.content}
          </div>
        ))}
      </div>
      <div className="card-footer">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
          />
          <button className="btn btn-primary" onClick={handleSend}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}