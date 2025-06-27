// frontend/components/PostList.tsx
import { useState } from 'react';

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  username: string;
  avatar: string;
}

interface PostListProps {
  posts: Post[];
  onUpdatePost?: (postId: string, content: string, file: File | null) => void;
  onDeletePost?: (postId: string) => void;
}

export default function PostList({ posts, onUpdatePost, onDeletePost }: PostListProps) {
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editFile, setEditFile] = useState<File | null>(null);

  const handleEdit = (post: Post) => {
    setEditingPost(post.id);
    setEditContent(post.content);
    setEditFile(null);
  };

  const handleSave = (postId: string) => {
    if (onUpdatePost) {
      onUpdatePost(postId, editContent, editFile);
      setEditingPost(null);
      setEditContent('');
      setEditFile(null);
    }
  };

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="card">
          <div className="card-body">
            <div className="d-flex align-items-center mb-2">
              <img src={post.avatar} alt={post.username} className="rounded-circle me-2" width="30" />
              <h5 className="card-title mb-0">{post.username}</h5>
            </div>
            {editingPost === post.id ? (
              <div>
                <textarea
                  className="form-control mb-2"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
                  className="form-control mb-2"
                />
                <button className="btn btn-success me-2" onClick={() => handleSave(post.id)}>
                  Save
                </button>
                <button className="btn btn-secondary" onClick={() => setEditingPost(null)}>
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <p className="card-text">{post.content}</p>
                {post.image_url && <img src={post.image_url} className="img-fluid mb-2" alt="Post image" />}
                {onUpdatePost && onDeletePost && (
                  <div>
                    <button className="btn btn-primary me-2" onClick={() => handleEdit(post)}>
                      Edit
                    </button>
                    <button className="btn btn-danger" onClick={() => onDeletePost(post.id)}>
                      Delete
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}