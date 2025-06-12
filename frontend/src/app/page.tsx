'use client';
import { useSession } from 'next-auth/react';
import Login from '../components/Login';
import Chat from '../components/Chat';

export default function Home() {
  const { data: session } = useSession();

  if (!session) return <Login />;
  return <Chat userId={session.user.id} />;
}