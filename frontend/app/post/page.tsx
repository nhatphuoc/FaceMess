// frontend/app/post/page.tsx
'use client';
import { useState, useEffect } from 'react';
import PostForm from '@/components/PostForm';
import PostList from '@/components/PostList';
import { fetchPosts, createPost, updatePost, deletePost } from '@/lib/api';

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  username: string;
  avatar: string;
}

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const email = typeof window !== 'undefined' ? localStorage.getItem('email') : null;

  useEffect(() => {
    if (!token || !email) {
      window.location.href = '/login';
      return;
    }

    const loadPosts = async () => {
      try {
        const data = await fetchPosts(token);
        setPosts(data);
        setError(null);
      } catch (err) {
        setError('Failed to load posts');
      }
    };

    loadPosts();
  }, [token, email]);

  const handleCreatePost = async (content: string, file: File | null) => {
    if (!token || !email) return;
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (file) formData.append('image', file);

      const newPost = await createPost(formData, token);
      setPosts([newPost, ...posts]);
      setError(null);
    } catch (err) {
      setError('Failed to create post');
    }
  };

  const handleUpdatePost = async (postId: string, content: string, file: File | null) => {
    if (!token || !email) return;
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (file) formData.append('image', file);

      const updatedPost = await updatePost(postId, formData, token);
      setPosts(posts.map((post) => (post.id === postId ? updatedPost : post)));
      setError(null);
    } catch (err) {
      setError('Failed to update post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!token || !email) return;
    try {
      await deletePost(postId, token);
      setPosts(posts.filter((post) => post.id !== postId));
      setError(null);
    } catch (err) {
      setError('Failed to delete post');
    }
  };

  if (!token || !email) return null;

  return (
    <div className="container my-4">
      <h1 className="text-center mb-4">Your Posts</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <PostForm onSubmit={handleCreatePost} />
      <PostList posts={posts} onUpdatePost={handleUpdatePost} onDeletePost={handleDeletePost} />
    </div>
  );
}