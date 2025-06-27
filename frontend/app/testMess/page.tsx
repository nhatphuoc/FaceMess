'use client';
import { useEffect, useState } from 'react';

export default async function PingPage() {
  let message = 'Loading...';
  try {
    const res = await fetch(`${process.env.MESSENGER_SERVER_URL}/api/testMess`, { cache: 'no-store' });
    if (res.ok) {
      message = await res.text();
    }
  } catch (error) {
    message = 'Failed to fetch';
  }

  return (
    <div style={{ backgroundColor: '#6a0dad', height: '100vh', color: 'white', textAlign: 'center', paddingTop: '20%' }}>
      {message}
    </div>
  );
}