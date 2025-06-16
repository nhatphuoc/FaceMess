'use client';

import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import FriendList from '@/components/FriendList';

interface Friend {
  id: string;
  username: string;
  status: string;
}

export default function Friends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  useEffect(() => {
    if (!token || !userId) {
      window.location.href = '/login';
      return;
    }

    fetch(`${process.env.FACEBOOK_SERVICE_URL}/friends?userId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setFriends(data));
  }, [token, userId]);

  const handleAddFriend = () => {
    const friendId = prompt('Enter friend ID to add:');
    if (friendId && token && userId) {
      fetch(`${process.env.FACEBOOK_SERVICE_URL}/friends`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, friendId }),
      })
        .then((res) => res.json())
        .then(() => {
          fetch(`${process.env.FACEBOOK_SERVICE_URL}/friends?userId=${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json()).then((data) => setFriends(data));
        });
    }
  };

  if (!token || !userId) return null;

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <h1 className="text-center my-4">Friends</h1>
          <FriendList friends={friends} onAddFriend={handleAddFriend} />
        </div>
      </div>
    </div>
  );
}