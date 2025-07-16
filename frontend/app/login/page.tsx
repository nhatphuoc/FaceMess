// frontend/app/login/page.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const email = urlParams.get('email');
    const error = urlParams.get('error');

    if (error) {
      toast.error('Đăng nhập thất bại: ' + error);
      window.history.replaceState({}, document.title, '/login');
      return;
    }

    if (token && email) {
      localStorage.setItem('token', token);
      localStorage.setItem('email', email);
      window.history.replaceState({}, document.title, '/login');
      router.push('/chat');
      return;
    }

    const storedToken = localStorage.getItem('token');
    const storedEmail = localStorage.getItem('email');
    if (storedToken && storedEmail) {
      router.push('/chat');
      return;
    }
  }, [router]);

  const handleLogin = () => {
    window.location.href = process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL as string;
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <ToastContainer />
      <h1>Đăng Nhập</h1>
      <button
        onClick={handleLogin}
        style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#4285F4', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        Đăng nhập bằng Google
      </button>
    </div>
  );
}