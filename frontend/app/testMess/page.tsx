'use client';
import { useEffect, useState } from 'react';

export default function PingPage() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    const fetchPing = async () => {
      try {
        const token = localStorage.getItem('token'); // Lấy token từ localStorage
        const res = await fetch(`${process.env.MESSENGER_SERVER_URL}/api/testMess`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          cache: 'no-store',
        });

        if (res.ok) {
          const text = await res.text();
          setMessage(text);
        } else {
          setMessage('Request failed with status ' + res.status);
        }
      } catch (err) {
        console.error('Error fetching:', err);
        setMessage('Failed to fetch');
      }
    };

    fetchPing();
  }, []);

  return (
    <div style={{ backgroundColor: '#6a0dad', height: '100vh', color: 'white', textAlign: 'center', paddingTop: '20%' }}>
      {message}
    </div>
  );
}
