'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import QRCode from 'qrcode.react'; // Правильный способ импорта

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      const role = session?.user?.role;
      if (role === 'ADMIN') router.push('/admin');
      else if (role === 'ENGINEER') router.push('/engineer');
      else router.push('/user');
    }
  }, [status, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn('credentials', {
      redirect: false,
      login,
      password,
    });

    if (res?.error) {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-10 rounded-3xl shadow-2xl w-[350px] text-white space-y-5"
      >
        <h2 className="text-3xl font-semibold text-center">Вход</h2>

        <div className="space-y-1">
          <label htmlFor="login" className="text-sm text-gray-300">
            Логин
          </label>
          <input
            id="login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Введите логин"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm text-gray-300">
            Пароль
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700 transition duration-200"
        >
          Войти
        </button>
      </form>
    </div>
  );
}