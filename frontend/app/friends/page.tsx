'use client';
import { useState, useEffect } from 'react';
import FriendList from '@/components/FriendList';
import { fetchFriends, fetchUserProfile, sendFriendRequest, fetchPendingRequests } from '@/lib/api';

interface Friend {
  id: string;
  username: string;
  avatar: string;
  email: string;
}

interface User {
  id: string;
  username: string;
  avatar: string;
  email: string;
}

interface FriendRequest {
  id: number;
  sender_id: string;
  sender_user_id: string;
  receiver_id: string;
  username: string;
  avatar: string;
  email: string;
  status: string;
}

export default function Friends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const email = typeof window !== 'undefined' ? localStorage.getItem('email') : null;

  useEffect(() => {
    if (!token || !email) {
      window.location.href = '/login';
      return;
    }

    const loadData = async () => {
      try {
        console.log('Fetching data with token:', token);
        const [friendsData, pendingRequestsData, userProfile] = await Promise.all([
          fetchFriends(token),
          fetchPendingRequests(token),
          fetchUserProfile('me', token)
        ]);

        console.log('Friends:', friendsData);
        console.log('Pending requests:', pendingRequestsData);
        console.log('User profile:', userProfile);

        setFriends(friendsData);
        setPendingRequests(pendingRequestsData);

        // Lấy danh sách yêu cầu đã gửi
        const sentRequestsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/friend-requests/sent`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!sentRequestsRes.ok) throw new Error('Failed to fetch sent requests');
        const sentRequestsData = await sentRequestsRes.json();
        console.log('Sent requests:', sentRequestsData); // Thêm log
        setSentRequests(sentRequestsData);

        // Lấy danh sách tất cả người dùng
        const usersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!usersRes.ok) throw new Error('Failed to fetch all users');
        const usersData = await usersRes.json();
        console.log('All users:', usersData); // Thêm log
        setAllUsers(usersData.filter((u: User) => u.email !== email)); // Loại trừ chính mình
        setError(null);
      } catch (err) {
        setError(`Failed to load data: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    loadData();
  }, [token, email]);

  const handleAddFriend = async (friendEmail: string) => {
    if (!token || !email) return;
    try {
      await sendFriendRequest(friendEmail, token);
      const sentRequestsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/friend-requests/sent`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!sentRequestsRes.ok) throw new Error('Failed to fetch sent requests');
      const sentRequestsData = await sentRequestsRes.json();
      setSentRequests(sentRequestsData);
      alert('Friend request sent!');
    } catch (err) {
      setError(`Failed to send friend request: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/friends/requests/${requestId}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ requestId })
      });
      if (!res.ok) throw new Error('Failed to accept request');
      if (!token) throw new Error('No token found');
      const updatedFriends = await fetchFriends(token);
      const updatedRequests = await fetchPendingRequests(token);
      setFriends(updatedFriends);
      setPendingRequests(updatedRequests);
      alert('Friend request accepted!');
    } catch (err) {
      setError(`Failed to accept request: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/friends/requests/${requestId}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ requestId })
      });
      if (!res.ok) throw new Error('Failed to reject request');
      if (!token) throw new Error('No token found');
      const updatedRequests = await fetchPendingRequests(token);
      setPendingRequests(updatedRequests);
      alert('Friend request rejected!');
    } catch (err) {
      setError(`Failed to reject request: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const toggleAllUsers = async () => {
    setShowAllUsers(!showAllUsers);
  };

  const getUserStatus = (user: User) => {
    const sentRequest = sentRequests.find(req => req.receiver_id === user.id);
    const receivedRequest = pendingRequests.find(req => req.sender_id === user.id);
    if (friends.some(f => f.id === user.id)) return 'Bạn bè';
    if (sentRequest && sentRequest.status === 'pending') return 'Đã gửi lời mời';
    if (receivedRequest && receivedRequest.status === 'pending') return 'Đang đợi phản hồi';
    if (sentRequest && sentRequest.status === 'rejected') return 'Đã từ chối';
    return 'Gửi lời mời kết bạn';
  };

  console.log('Rendering pendingRequests:', pendingRequests); // Thêm log

  if (!token || !email) return null;

  return (
    <div className="container my-4">
      <h1 className="text-center mb-4">Friends</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <h3>Incoming Friend Requests</h3>
      {pendingRequests.length === 0 ? (
        <p>No pending friend requests.</p>
      ) : (
        <ul className="list-group mb-4">
          {pendingRequests.map(req => (
            <li key={req.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <img src={req.avatar} alt={req.username} className="rounded-circle me-2" width="30" />
                {req.username} ({req.email})
              </div>
              <div>
                <button
                  className="btn btn-success btn-sm me-2"
                  onClick={() => handleAcceptRequest(req.id)}
                >
                  Accept
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRejectRequest(req.id)}
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button className="btn btn-primary mb-4" onClick={toggleAllUsers}>
        {showAllUsers ? 'Hide All Users' : 'Add Friend'}
      </button>

      {showAllUsers && (
        <div className="my-4">
          <h3>All Users</h3>
          <ul className="list-group">
            {allUsers.map(user => (
              <li key={user.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <img src={user.avatar} alt={user.username} className="rounded-circle me-2" width="30" />
                  {user.username} ({user.email})
                </div>
                <button
                  className={`btn btn-sm ${getUserStatus(user) === 'Bạn bè' ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => getUserStatus(user) === 'Gửi lời mời kết bạn' && handleAddFriend(user.email)}
                  disabled={getUserStatus(user) !== 'Gửi lời mời kết bạn'}
                >
                  {getUserStatus(user)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <FriendList friends={friends} onAddFriend={handleAddFriend} />
    </div>
  );
}