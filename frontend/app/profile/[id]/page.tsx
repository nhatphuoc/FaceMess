// frontend/app/profile/[id]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import FriendList from '@/components/FriendList';
import PostList from '@/components/PostList';
import PostForm from '@/components/PostForm';
import { fetchFriends, sendFriendRequest, fetchUser, fetchPosts } from '@/lib/api';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isFriend?: boolean;
}

interface Post {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  username?: string;
  avatar?: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [friends, setFriends] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const router = useRouter();
  const { id } = useParams();
  const email = typeof window !== 'undefined' ? localStorage.getItem('email') : null;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!email || !token) {
      router.push('/login');
      return;
    }

    // Fetch user profile
    fetchUser(id as string, token!)
      .then((data) => setUser(data))
      .catch((error) => {
        console.error('Error fetching user:', error);
        if (error.message === 'Unauthorized') {
          localStorage.removeItem('token');
          localStorage.removeItem('email');
          router.push('/login');
          toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
        } else {
          toast.error('Không thể tải thông tin hồ sơ');
        }
      });

    // Fetch friends (all users with isFriend status)
    fetchFriends(token!)
      .then((data) => setFriends(data))
      .catch((error) => {
        console.error('Error fetching friends:', error);
        if (error.message === 'Unauthorized') {
          localStorage.removeItem('token');
          localStorage.removeItem('email');
          router.push('/login');
          toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
        } else {
          toast.error('Không thể tải danh sách người dùng');
        }
      });

    // Fetch posts
    fetchPosts(id as string, token!)
      .then((data) => setPosts(data))
      .catch((error) => {
        console.error('Error fetching posts:', error);
        if (error.message === 'Unauthorized') {
          localStorage.removeItem('token');
          localStorage.removeItem('email');
          router.push('/login');
          toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
        } else {
          toast.error('Không thể tải bài viết');
        }
      });
  }, [email, token, id, router]);

  const handleAddFriend = async (friendEmail: string) => {
    if (!friendEmail || friendEmail === email) {
      toast.error('Email không hợp lệ hoặc không thể thêm chính mình');
      return;
    }
    try {
      await sendFriendRequest(friendEmail, token!);
      toast.success('Đã gửi yêu cầu kết bạn');
      fetchFriends(token!).then(setFriends);
    } catch (error) {
      console.error('Error sending friend request:', error);
      if (error.message === 'Unauthorized') {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        router.push('/login');
        toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
      } else {
        toast.error('Không thể gửi yêu cầu kết bạn');
      }
    }
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostUpdated = (updatedPost: Post) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  if (!email || !token || !user) return <div className="container text-center mt-5">Đang tải...</div>;

  const isOwnProfile = user.email === email;

  return (
    <div className="container">
      <ToastContainer />
      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
        <div className="container-fluid">
          <a className="navbar-brand" href="/chat">Messenger</a>
          <div className="navbar-nav">
            <a className="nav-link" href="/chat">Chat</a>
            <a className="nav-link" href="/friends">Bạn bè</a>
            <a className="nav-link active" href={`/profile/${email}`}>Hồ sơ</a>
            <button
              className="btn btn-outline-danger ms-2"
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
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body text-center">
              <img
                src={user.avatar || '/default-avatar.png'}
                alt={user.username || user.email}
                className="rounded-circle mb-3"
                width="120"
                height="120"
              />
              <h3 className="card-title">{user.username || user.email}</h3>
              <p className="card-text">{user.email}</p>
              {!isOwnProfile && !user.isFriend && (
                <button
                  className="btn btn-primary"
                  onClick={() => handleAddFriend(user.email)}
                >
                  Thêm bạn
                </button>
              )}
              {!isOwnProfile && user.isFriend && (
                <span className="badge bg-success">Bạn bè</span>
              )}
            </div>
          </div>
          <FriendList friends={friends} onAddFriend={handleAddFriend} />
        </div>
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-body">
              <h4 className="card-title">Thông tin hồ sơ</h4>
              <p><strong>Tên người dùng:</strong> {user.username || user.email}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </div>
          </div>
          {isOwnProfile && (
            <div className="mb-4">
              <h4>Đăng bài viết</h4>
              <PostForm token={token} onPostCreated={handlePostCreated} />
            </div>
          )}
          <h4>{isOwnProfile ? 'Bài viết của bạn' : `Bài viết của ${user.username || user.email}`}</h4>
          <PostList
            posts={posts}
            isOwnProfile={isOwnProfile}
            token={token}
            onPostUpdated={handlePostUpdated}
            onPostDeleted={handlePostDeleted}
          />
        </div>
      </div>
    </div>
  );
}