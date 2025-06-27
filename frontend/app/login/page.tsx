
// frontend/app/login/page.tsx 
'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    // const code = urlParams.get('code');
    const token = urlParams.get('token');
    const email = urlParams.get('email');
    const error = urlParams.get('error');

    // Nếu có error từ backend
    if (error) {
      alert('Login failed: ' + error);
      // Clear URL params
      window.history.replaceState({}, document.title, '/login');
      return;
    }

    // Nếu có token và email từ URL params (sau redirect từ backend)
    if (token && email) {
      localStorage.setItem('token', token);
      localStorage.setItem('email', email);
      // Clear URL params và chuyển đến chat
      window.history.replaceState({}, document.title, '/login');
      router.push('/post');
      return;
    }

    // Nếu có code thì xử lý callback (giữ nguyên logic cũ)
    // if (code) {
    //   handleCallback(code);
    //   return;
    // }

    // Kiểm tra token và email đã có trong localStorage
    const storedToken = localStorage.getItem('token');
    const storedEmail = localStorage.getItem('email');
  }, []);

  const handleCallback = async (code: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/auth/callback/google?code=${code}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('email', data.emailUser);
        router.push('/chat');
      } else {
        console.error('Login failed:', data.error);
        alert('Login failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error during callback:', error);
      alert('Login error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    setLoading(true);
    // window.location.href = process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL as string;
    window.location.href = process.env.GOOGLE_REDIRECT_URI as string;
  };

  if (loading) return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Processing login...</h2>
      <div>Please wait...</div>
    </div>
  );

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Login Page</h1>
      <button onClick={handleLogin} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Login with Google
      </button>
    </div>
  );
}

// 'use client';
// import { useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';

// export default function Login() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const code = urlParams.get('code');
//     const error = urlParams.get('error');

//     if (error) {
//       alert('Login failed: ' + error);
//       window.history.replaceState({}, document.title, '/login');
//       return;
//     }

//     if (code) {
//       handleCallback(code);
//       return;
//     }

//     const storedToken = localStorage.getItem('token');
//     const storedEmail = localStorage.getItem('email');
//     if (storedToken && storedEmail) {
//       router.push('/friends');
//     }
//   }, []);

//   const handleCallback = async (code: string) => {
//     setLoading(true);
//     try {
//       const response = await fetch('http://localhost:5000/api/auth/callback/google', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ code }),
//       });
//       const data = await response.json();
//       if (response.ok) {
//         localStorage.setItem('token', data.token);
//         localStorage.setItem('email', data.email);
//         window.history.replaceState({}, document.title, '/login');
//         router.push('/friends');
//       } else {
//         console.error('Login failed:', data.error);
//         alert('Login failed: ' + data.error);
//       }
//     } catch (error) {
//       console.error('Error during callback:', error);
//       alert('Login error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogin = () => {
//     setLoading(true);
//     window.location.href = 'http://localhost:5000/api/auth/google';
//   };

//   if (loading) return (
//     <div style={{ textAlign: 'center', marginTop: '50px' }}>
//       <h2>Processing login...</h2>
//       <div>Please wait...</div>
//     </div>
//   );

//   return (
//     <div style={{ textAlign: 'center', marginTop: '100px' }}>
//       <h1>Login Page</h1>
//       <button onClick={handleLogin} style={{ padding: '10px 20px', fontSize: '16px' }}>
//         Login with Google
//       </button>
//     </div>
//   );
// }