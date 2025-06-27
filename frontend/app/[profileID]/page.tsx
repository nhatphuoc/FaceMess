// frontend/app/[profileID]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import PostList from '@/components/PostList';
import { fetchUserProfile, fetchUserPosts, sendFriendRequest } from '@/lib/api';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar: string;
}

interface Post {
  id: string;
  content: string;
  image_url: string;
  username: string;
  avatar: string;
}

export default function Profile({ params }: { params: { profileId: string } }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const email = typeof window !== 'undefined' ? localStorage.getItem('email') : null;

  useEffect(() => {
    if (!token || !email) {
      window.location.href = '/login';
      return;
    }

    const loadProfile = async () => {
      try {
        const profileData = await fetchUserProfile(params.profileId, token);
        const postsData = await fetchUserPosts(params.profileId, token);
        setProfile(profileData);
        setPosts(postsData);
        setError(null);
      } catch (err) {
        setError('Failed to load profile or posts');
      }
    };

    loadProfile();
  }, [params.profileId, token, email]);

  const handleSendFriendRequest = async () => {
    if (!profile || !token || !email) return;
    try {
      await sendFriendRequest(profile.email, token);
      alert('Friend request sent!');
    } catch (err) {
      setError('Failed to send friend request');
    }
  };

  if (!token || !email) return null;
  if (!profile) return <div>Loading...</div>;

  return (
    <div className="container my-4">
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="text-center mb-4">
        <img src={profile.avatar} alt={profile.username} className="rounded-circle mb-2" width="100" />
        <h1>{profile.username}</h1>
        <p>{profile.email}</p>
        <button className="btn btn-primary" onClick={handleSendFriendRequest}>
          Add Friend
        </button>
      </div>
      <h2>Posts</h2>
      <PostList posts={posts} />
    </div>
  );
}