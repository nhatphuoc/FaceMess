// frontend/lib/api.ts
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

interface Post {
  id: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
}

interface Message {
  id: string;
  senderEmail: string;
  receiverEmail: string;
  content: string;
  timestamp: string;
  mediaUrl?: string;
}

export async function fetchFriends(token: string): Promise<User[]> {
  console.log('Calling fetchFriends with URL:', `${process.env.NEXT_PUBLIC_MESSENGER_SERVER_URL}/friends`, 'Method: GET');
  const res = await fetch(`${process.env.NEXT_PUBLIC_MESSENGER_SERVER_URL}/friends`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorText = await res.text();
    if (res.status === 401) throw new Error('Unauthorized');
    if (res.status === 500) throw new Error(`Lỗi server: ${errorText}`);
    throw new Error(`Không thể lấy danh sách bạn bè: ${res.status} - ${errorText}`);
  }
  return res.json();
}

export async function sendFriendRequest(friendEmail: string, token: string): Promise<void> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_FB_SERVER_URL}/friends/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ friendEmail }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    if (res.status === 401) throw new Error('Unauthorized');
    if (res.status === 400) throw new Error(`Yêu cầu không hợp lệ: ${errorText}`);
    if (res.status === 404) throw new Error(`Người dùng không tồn tại: ${errorText}`);
    throw new Error(`Không thể gửi yêu cầu kết bạn: ${res.status} - ${errorText}`);
  }
}

export async function fetchPendingRequests(token: string): Promise<FriendRequest[]> {
  console.log('Calling fetchPendingRequests with URL:', `${process.env.NEXT_PUBLIC_FB_SERVER_URL}/friends/requests`, 'Method: GET');
  const res = await fetch(`${process.env.NEXT_PUBLIC_FB_SERVER_URL}/friends/requests`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorText = await res.text();
    if (res.status === 401) throw new Error('Unauthorized');
    if (res.status === 500) throw new Error(`Lỗi server: ${errorText}`);
    throw new Error(`Không thể lấy yêu cầu kết bạn đang chờ: ${res.status} - ${errorText}`);
  }
  return res.json();
}

export async function fetchSentRequests(token: string): Promise<FriendRequest[]> {
  console.log('Calling fetchSentRequests with URL:', `${process.env.NEXT_PUBLIC_FB_SERVER_URL}/friends/requests/sent`, 'Method: GET');
  const res = await fetch(`${process.env.NEXT_PUBLIC_FB_SERVER_URL}/friends/requests/sent`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorText = await res.text();
    if (res.status === 401) throw new Error('Unauthorized');
    if (res.status === 500) throw new Error(`Lỗi server: ${errorText}`);
    throw new Error(`Không thể lấy yêu cầu kết bạn đã gửi: ${res.status} - ${errorText}`);
  }
  return res.json();
}

export async function acceptFriendRequest(senderEmail: string, token: string): Promise<void> {
  console.log('Calling acceptFriendRequest with URL:', `${process.env.NEXT_PUBLIC_FB_SERVER_URL}/friends/requests/accept`, 'Method: POST');
  const res = await fetch(`${process.env.NEXT_PUBLIC_FB_SERVER_URL}/friends/requests/accept`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ senderEmail }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    if (res.status === 401) throw new Error('Unauthorized');
    if (res.status === 400) throw new Error(`Yêu cầu không hợp lệ: ${errorText}`);
    if (res.status === 404) throw new Error(`Yêu cầu kết bạn không tồn tại: ${errorText}`);
    throw new Error(`Không thể chấp nhận yêu cầu kết bạn: ${res.status} - ${errorText}`);
  }
}

export async function rejectFriendRequest(senderEmail: string, token: string): Promise<void> {
  console.log('Calling rejectFriendRequest with URL:', `${process.env.NEXT_PUBLIC_FB_SERVER_URL}/friends/requests/reject`, 'Method: POST');
  const res = await fetch(`${process.env.NEXT_PUBLIC_FB_SERVER_URL}/friends/requests/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ senderEmail }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    if (res.status === 401) throw new Error('Unauthorized');
    if (res.status === 400) throw new Error(`Yêu cầu không hợp lệ: ${errorText}`);
    if (res.status === 404) throw new Error(`Yêu cầu kết bạn không tồn tại: ${errorText}`);
    throw new Error(`Không thể từ chối yêu cầu kết bạn: ${res.status} - ${errorText}`);
  }
}

export async function fetchMessages(senderEmail: string, receiverEmail: string, token: string): Promise<Message[]> {
  console.log('Calling fetchMessages with URL:', `${process.env.NEXT_PUBLIC_MESSENGER_SERVER_URL}/messages?senderEmail=${senderEmail}&receiverEmail=${receiverEmail}`, 'Method: GET');
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_MESSENGER_SERVER_URL}/messages?senderEmail=${senderEmail}&receiverEmail=${receiverEmail}`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) {
    const errorText = await res.text();
    if (res.status === 401) throw new Error('Unauthorized');
    throw new Error(`Không thể lấy tin nhắn: ${res.status} - ${errorText}`);
  }
  return res.json();
}

export async function sendMessage(formData: FormData, token: string): Promise<Message> {
  console.log('Calling sendMessage with URL:', `${process.env.NEXT_PUBLIC_MESSENGER_SERVER_URL}/messages`, 'Method: POST');
  const res = await fetch(`${process.env.NEXT_PUBLIC_MESSENGER_SERVER_URL}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const errorText = await res.text();
    if (res.status === 401) throw new Error('Unauthorized');
    throw new Error(`Không thể gửi tin nhắn: ${res.status} - ${errorText}`);
  }
  return res.json();
}

export async function fetchPosts(token: string): Promise<Post[]> {
  console.log('Calling fetchPosts with URL:', `${process.env.NEXT_PUBLIC_FB_SERVER_URL}/posts/user/me`, 'Method: GET');
  const res = await fetch(`${process.env.NEXT_PUBLIC_FB_SERVER_URL}/posts/user/me`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorText = await res.text();
    if (res.status === 401) throw new Error('Unauthorized');
    throw new Error(`Không thể lấy bài viết: ${res.status} - ${errorText}`);
  }
  return res.json();
}

export async function createPost(formData: FormData, token: string): Promise<Post> {
  console.log('Calling createPost with URL:', `${process.env.NEXT_PUBLIC_FB_SERVER_URL}/posts`, 'Method: POST');
  const res = await fetch(`${process.env.NEXT_PUBLIC_FB_SERVER_URL}/posts`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const errorText = await res.text();
    if (res.status === 401) throw new Error('Unauthorized');
    throw new Error(`Không thể tạo bài viết: ${res.status} - ${errorText}`);
  }
  return res.json();
}

export async function updatePost(postId: string, formData: FormData, token: string): Promise<Post> {
  console.log('Calling updatePost with URL:', `${process.env.NEXT_PUBLIC_FB_SERVER_URL}/posts/${postId}`, 'Method: PUT');
  const res = await fetch(`${process.env.NEXT_PUBLIC_FB_SERVER_URL}/posts/${postId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const errorText = await res.text();
    if (res.status === 401) throw new Error('Unauthorized');
    throw new Error(`Không thể cập nhật bài viết: ${res.status} - ${errorText}`);
  }
  return res.json();
}

export async function deletePost(postId: string, token: string): Promise<void> {
  console.log('Calling deletePost with URL:', `${process.env.NEXT_PUBLIC_FB_SERVER_URL}/posts/${postId}`, 'Method: DELETE');
  const res = await fetch(`${process.env.NEXT_PUBLIC_FB_SERVER_URL}/posts/${postId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorText = await res.text();
    if (res.status === 401) throw new Error('Unauthorized');
    throw new Error(`Không thể xóa bài viết: ${res.status} - ${errorText}`);
  }
}