'use client';
import { signIn } from 'next-auth/react';

export default function Login() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <button onClick={() => signIn('google')} className="px-4 py-2 mb-4 bg-blue-500 text-white rounded">
        Sign in with Google
      </button>
      <form onSubmit={(e) => {
        e.preventDefault();
        signIn('credentials', { email: e.currentTarget.email.value, password: e.currentTarget.password.value });
      }} className="flex flex-col space-y-4">
        <input name="email" type="text" className="px-2 py-1 border rounded" />
        <input name="password" type="password" className="px-2 py-1 border rounded" />
        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded">
          Sign in
        </button>
      </form>
    </div>
  );
}