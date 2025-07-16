// frontend/app/friends/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import FriendList from '@/components/FriendList';
import SearchBar from '@/components/SearchBar';
import { fetchFriends, fetchPendingRequests, fetchSentRequests, sendFriendRequest, acceptFriendRequest, rejectFriendRequest } from '@/lib/api';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isFriend?: boolean;
}

interface FriendRequest {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export default function FriendsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const router = useRouter();
  const email = typeof window !== 'undefined' ? localStorage.getItem('email') : null;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!email || !token) {
      router.push('/login');
      return;
    }

    // Fetch all users with isFriend status
    fetchFriends(token!)
      .then((data) => {
        setUsers(data);
        setFilteredUsers(data);
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
        if (error.message === 'Unauthorized') {
          localStorage.removeItem('token');
          localStorage.removeItem('email');
          router.push('/login');
          toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
        } else {
          toast.error('Không thể tải danh sách người dùng');
        }
      });

    // Fetch pending requests
    fetchPendingRequests(token!)
      .then((data) => setPendingRequests(data))
      .catch((error) => {
        console.error('Error fetching pending requests:', error);
        if (error.message === 'Unauthorized') {
          localStorage.removeItem('token');
          localStorage.removeItem('email');
          router.push('/login');
          toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
        } else {
          toast.error('Không thể tải yêu cầu kết bạn đang chờ');
        }
      });

    // Fetch sent requests
    fetchSentRequests(token!)
      .then((data) => setSentRequests(data))
      .catch((error) => {
        console.error('Error fetching sent requests:', error);
        if (error.message === 'Unauthorized') {
          localStorage.removeItem('token');
          localStorage.removeItem('email');
          router.push('/login');
          toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
        } else {
          toast.error('Không thể tải yêu cầu kết bạn đã gửi');
        }
      });
  }, [email, token, router]);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredUsers(users);
      return;
    }
    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleAddFriend = async (friendEmail: string) => {
    if (!friendEmail || friendEmail === email) {
      toast.error('Email không hợp lệ hoặc không thể thêm chính mình');
      return;
    }
    try {
      await sendFriendRequest(friendEmail, token!);
      toast.success('Đã gửi yêu cầu kết bạn');
      fetchFriends(token!).then((data) => {
        setUsers(data);
        setFilteredUsers(data);
      });
      fetchSentRequests(token!).then(setSentRequests);
    } catch (error) {
      console.error('Error sending friend request:', error);
      if (typeof error === 'object' && error !== null && 'message' in error && (error as any).message === 'Unauthorized') {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        router.push('/login');
        toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
      } else {
        toast.error('Không thể gửi yêu cầu kết bạn');
      }
    }
  };

  const handleAcceptRequest = async (senderEmail: string) => {
    try {
      await acceptFriendRequest(senderEmail, token!);
      toast.success('Đã chấp nhận yêu cầu kết bạn');
      setPendingRequests(pendingRequests.filter((req) => req.email !== senderEmail));
      fetchFriends(token!).then((data) => {
        setUsers(data);
        setFilteredUsers(data);
      });
    } catch (error) {
      console.error('Error accepting friend request:', error);
      if (typeof error === 'object' && error !== null && 'message' in error && (error as any).message === 'Unauthorized') {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        router.push('/login');
        toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
      } else {
        toast.error('Không thể chấp nhận yêu cầu kết bạn');
      }
    }
  };

  const handleRejectRequest = async (senderEmail: string) => {
    try {
      await rejectFriendRequest(senderEmail, token!);
      toast.success('Đã từ chối yêu cầu kết bạn');
      setPendingRequests(pendingRequests.filter((req) => req.email !== senderEmail));
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      if (typeof error === 'object' && error !== null && 'message' in error && (error as any).message === 'Unauthorized') {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        router.push('/login');
        toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
      } else {
        toast.error('Không thể từ chối yêu cầu kết bạn');
      }
    }
  };

  if (!email || !token) return <div className="container text-center mt-5">Đang tải...</div>;

  return (
    <div className="container">
      <ToastContainer />
      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
        <div className="container-fluid">
          <a className="navbar-brand" href="/chat">Messenger</a>
          <div className="navbar-nav">
            <a className="nav-link" href="/chat">Chat</a>
            <a className="nav-link active" href="/friends">Bạn bè</a>
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
      <h1 className="text-center my-4">Danh sách người dùng</h1>
      <SearchBar onSearch={handleSearch} />
      <div className="row">
        <div className="col-md-6">
          <FriendList friends={filteredUsers} onAddFriend={handleAddFriend} />
        </div>
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h4 className="card-title">Yêu cầu kết bạn đang chờ</h4>
              <ul className="list-group list-group-flush">
                {pendingRequests.length === 0 && <li className="list-group-item">Không có yêu cầu nào</li>}
                {pendingRequests.map((req) => (
                  <li key={req.email} className="list-group-item d-flex align-items-center">
                    <img
                      src={req.avatar || '/default-avatar.png'}
                      alt={req.username || req.email}
                      className="rounded-circle me-2"
                      width="30"
                    />
                    {req.username || req.email}
                    <button
                      className="btn btn-sm btn-success ms-auto me-2"
                      onClick={() => handleAcceptRequest(req.email)}
                    >
                      Chấp nhận
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleRejectRequest(req.email)}
                    >
                      Từ chối
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Yêu cầu kết bạn đã gửi</h4>
              <ul className="list-group list-group-flush">
                {sentRequests.length === 0 && <li className="list-group-item">Không có yêu cầu nào</li>}
                {sentRequests.map((req) => (
                  <li key={req.email} className="list-group-item d-flex align-items-center">
                    <img
                      src={req.avatar || '/default-avatar.png'}
                      alt={req.username || req.email}
                      className="rounded-circle me-2"
                      width="30"
                    />
                    {req.username || req.email}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}