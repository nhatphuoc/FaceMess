// frontend/lib/api.ts
export async function fetchFriends(token: string): Promise<any[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/friends`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch friends');
  return res.json();
}

export async function searchUsers(query: string, token: string): Promise<any[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/search?q=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to search users');
  return res.json();
}

export async function fetchUserProfile(userId: string, token: string): Promise<any> {
  const endpoint = userId === 'me' ? '/users/me' : `/users/${userId}`;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch profile: ${res.statusText}`);
  return res.json();
}

export async function fetchUserPosts(userId: string, token: string): Promise<any[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export async function fetchPosts(token: string): Promise<any[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/user/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export async function sendFriendRequest(friendEmail: string, token: string): Promise<void> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/friends/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ friendEmail }),
  });
  if (!res.ok) throw new Error('Failed to send friend request');
}

export async function fetchPendingRequests(token: string): Promise<any[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/friends/requests`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch pending requests');
  return res.json();
}

export async function fetchSentRequests(token: string): Promise<any[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/friend-requests/sent`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch sent requests');
  return res.json();
}

export async function fetchAllUsers(token: string): Promise<any[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch all users');
  return res.json();
}

export async function createPost(formData: FormData, token: string): Promise<any> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to create post');
  return res.json();
}

export async function updatePost(postId: string, formData: FormData, token: string): Promise<any> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to update post');
  return res.json();
}

export async function deletePost(postId: string, token: string): Promise<void> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete post');
}