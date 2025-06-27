// frontend/app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    redirect('/chat');
  } else {
    redirect('/login');
  }
}