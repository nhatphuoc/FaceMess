'use client';
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

interface Message {
  senderId: string;
  receiverId: string;
  content: string;
  mediaUrl?: string;
}

export default function Chat({ userId }: { userId: string }) {
  const [friendId, setFriendId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [media, setMedia] = useState('');
  const socketRef = useRef<any>(null);

  useEffect(() => {
    socketRef.current = io(`${process.env.MESSENGER_WS_URL}/ws/${userId}/${friendId}`, {
      auth: { token: localStorage.getItem('token') },
    });

    socketRef.current.on('connect', () => {});
    socketRef.current.on('message', (msg: Message) => setMessages((prev) => [...prev, msg]));
    socketRef.current.on('status', (data: { userId: string; status: string }) => console.log(data));

    return () => {
      socketRef.current.disconnect();
    };
  }, [friendId]);

  const sendMessage = () => {
    socketRef.current.emit('message', { content: message, mediaUrl: media });
    setMessage('');
    setMedia('');
  };

  const checkFriend = async () => {
    const res = await fetch(`${process.env.FACEBOOK_API_URL}/friends/check/${friendId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const { isFriend } = await res.json();
    if (isFriend) setFriendId(friendId);
  };

  return (
    <div className="p-4">
      <div className="flex space-x-2 mb-4">
        <input value={friendId} onChange={(e) => setFriendId(e.target.value)} className="px-2 py-1 border rounded" />
        <button onClick={checkFriend} className="px-4 py-2 bg-blue-500 text-white rounded">
          Check Friend
        </button>
      </div>
      <div className="h-64 overflow-y-auto border rounded p-2 mb-4">
        {messages.map((m, i) => <div key={i} className="mb-2">{m.content}</div>)}
      </div>
      <div className="flex space-x-2">
        <input value={message} onChange={(e) => setMessage(e.target.value)} className="flex-1 px-2 py-1 border rounded" />
        <input value={media} onChange={(e) => setMedia(e.target.value)} className="flex-1 px-2 py-1 border rounded" />
        <button onClick={sendMessage} className="px-4 py-2 bg-green-500 text-white rounded">
          Send
        </button>
      </div>
    </div>
  );
}