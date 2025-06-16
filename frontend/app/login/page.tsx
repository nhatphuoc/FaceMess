'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Login() {
  const router = useRouter();

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.MESSENGER_SERVER_URL}/auth/google`;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userId = urlParams.get('userId');
    if (token && userId) {
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      router.push('/chat');
    }
  }, [router]);

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card p-4 shadow-sm">
        <h2 className="text-center mb-4">Login</h2>
        <button
          className="btn btn-danger w-100"
          onClick={handleGoogleLogin}
        >
          Login with Google
        </button>
      </div>
    </div>
  );
}