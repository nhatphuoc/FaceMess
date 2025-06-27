// frontend/components/PostForm.tsx
import { useState } from 'react';

interface PostFormProps {
  onSubmit: (content: string, file: File | null) => void;
}

export default function PostForm({ onSubmit }: PostFormProps) {
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('Content is required');
      return;
    }
    onSubmit(content, file);
    setContent('');
    setFile(null);
  };

  return (
    <form onSubmit={handleSubmit} className="card mb-4">
      <div className="card-body">
        <textarea
          className="form-control mb-2"
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <input
          type="file"
          accept="image/jpeg,image/png"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="form-control mb-2"
        />
        <button type="submit" className="btn btn-primary">
          Post
        </button>
      </div>
    </form>
  );
}