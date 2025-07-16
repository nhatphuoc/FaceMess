// frontend/app/chat/page.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ChatComponent from '@/components/ChatComponents';
import { fetchFriends, fetchMessages } from '@/lib/api';

interface Message {
  id: string;
  senderEmail: string;
  receiverEmail: string;
  content: string;
  timestamp: string;
  mediaUrl?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isFriend?: boolean;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [selectedUserIsFriend, setSelectedUserIsFriend] = useState<boolean>(false);
  const socketRef = useRef<W3CWebSocket | null>(null);
  const router = useRouter();
  const isMounted = useRef(false);

  const email = typeof window !== 'undefined' ? localStorage.getItem('email') : null;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (!email || !token) {
      router.push('/login');
      return;
    }

    // Fetch danh sách người dùng với trạng thái isFriend
    fetchFriends(token)
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error('Dữ liệu trả về không phải mảng:', data);
          toast.error('Dữ liệu người dùng không hợp lệ');
        }
      })
      .catch((error) => {
        console.error('Lỗi khi fetch friends:', error);
        if (error.message === 'Unauthorized') {
          localStorage.removeItem('token');
          localStorage.removeItem('email');
          router.push('/login');
          toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
        } else {
          toast.error('Không thể tải danh sách người dùng');
        }
      });
  }, [email, token, router]);

  useEffect(() => {
    if (!selectedUserEmail || !email || !token) return;

    // Tìm người dùng được chọn để kiểm tra isFriend
    const selectedUser = users.find((user) => user.email === selectedUserEmail);
    const isFriend = selectedUser?.isFriend ?? false;
    setSelectedUserIsFriend(isFriend);

    if (!isFriend) {
      setMessages([]); // Xóa tin nhắn nếu không phải bạn bè
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      return;
    }

    // Kết nối WebSocket và lấy tin nhắn cũ nếu là bạn bè
    const wsUrl = `${process.env.NEXT_PUBLIC_MESSENGER_SERVER_URL!.replace('http', 'ws')}/ws/${selectedUserEmail}?token=${encodeURIComponent(token)}`;
    socketRef.current = new W3CWebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log('WebSocket Connected');
      toast.success('Đã kết nối WebSocket');
    };

    socketRef.current.onmessage = (message) => {
      const envelope = JSON.parse(message.data as string);
      if (envelope.type === 'message') {
        setMessages((prev) => [...prev, envelope.data]);
      } else if (envelope.type === 'messages') {
        setMessages(envelope.data);
      } else if (envelope.type === 'error') {
        toast.error('Lỗi WebSocket: ' + envelope.data.error);
      }
    };

    socketRef.current.onerror = () => {
      toast.error('Lỗi kết nối WebSocket, đang thử lại...');
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket Disconnected, reconnecting...');
      setTimeout(() => {
        if (selectedUserEmail && token && isFriend) {
          socketRef.current = new W3CWebSocket(wsUrl);
          socketRef.current.onopen = () => toast.success('Đã kết nối lại WebSocket');
          socketRef.current.onmessage = socketRef.current.onmessage;
          socketRef.current.onerror = socketRef.current.onerror;
          socketRef.current.onclose = socketRef.current.onclose;
        }
      }, 1000);
    };

    // Lấy tin nhắn cũ
    fetchMessages(email, selectedUserEmail, token)
      .then((data) => {
        setMessages(data);
      })
      .catch((error) => {
        console.error('Lỗi lấy tin nhắn:', error);
        if (error.message === 'Unauthorized') {
          localStorage.removeItem('token');
          localStorage.removeItem('email');
          router.push('/login');
          toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
        } else {
          toast.error('Không thể tải tin nhắn');
        }
      });

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [selectedUserEmail, email, token, users, router]);

  const sendMessage = (content: string) => {
    if (!selectedUserIsFriend) {
      toast.error('Cần kết bạn để gửi tin nhắn');
      return;
    }
    if (content.trim() && socketRef.current && email && token && selectedUserEmail) {
      const message: Message = {
        id: '',
        senderEmail: email,
        receiverEmail: selectedUserEmail,
        content,
        timestamp: new Date().toISOString(),
        mediaUrl: '',
      };
      socketRef.current.send(JSON.stringify(message));
    }
  };

  if (!email || !token) return <div className="container text-center mt-5">Đang tải...</div>;

  return (
    <div className="container-fluid">
      <ToastContainer />
      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
        <div className="container-fluid">
          <a className="navbar-brand" href="/chat">Messenger</a>
          <div className="navbar-nav">
            <a className="nav-link active" href="/chat">Chat</a>
            <a className="nav-link" href="/friends">Bạn bè</a>
            <a className="nav-link" href={`/profile/${email}`}>Hồ sơ</a>
            <button
              className="btn btn-outline-danger"
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('email');
                router.push('/login');
              }}
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </nav>
      <div className="row">
        <div className="col-3">
          <h3>Danh sách người dùng</h3>
          <ul className="list-group">
            {users.length === 0 && <li className="list-group-item">Không có người dùng hoặc tải thất bại</li>}
            {users.map((user) => (
              <li
                key={user.email}
                className={`list-group-item ${selectedUserEmail === user.email ? 'active' : ''}`}
                onClick={() => setSelectedUserEmail(user.email)}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={user.avatar || '/default-avatar.png'}
                  alt={user.username || user.email}
                  className="rounded-circle me-2"
                  width="30"
                />
                {user.username || user.email}
                {user.isFriend && <span className="badge bg-success ms-2">Bạn bè</span>}
              </li>
            ))}
          </ul>
        </div>
        <div className="col-9">
          <h1 className="text-center my-4">
            Chat với {selectedUserEmail ? users.find((u) => u.email === selectedUserEmail)?.username || selectedUserEmail : 'Chọn người dùng'}
          </h1>
          {selectedUserEmail ? (
            <ChatComponent
              messages={messages}
              onSend={sendMessage}
              isFriend={selectedUserIsFriend}
              receiverEmail={selectedUserEmail}
            />
          ) : (
            <p className="text-center">Vui lòng chọn một người dùng để trò chuyện</p>
          )}
        </div>
      </div>
    </div>
  );
}