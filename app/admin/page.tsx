'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@prisma/client';
import { signOut } from 'next-auth/react';

const AdminPage = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [role, setRole] = useState('USER');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) throw new Error('Ошибка при получении данных');
        const data = await response.json();
        if (Array.isArray(data)) setUsers(data);
        else throw new Error('Неверный формат данных');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (response.ok) setUsers(users.filter((user) => user.id !== userId));
      else throw new Error('Ошибка при удалении пользователя');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const userData = { login, password, nickname, role };

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error('Ошибка при добавлении пользователя');

      const newUser = await response.json();
      setUsers((prevUsers) => [...prevUsers, newUser]);
      setLogin('');
      setPassword('');
      setNickname('');
      setRole('USER');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-start justify-center py-10">
      <div className="flex flex-col items-center gap-6">
        <div className="flex justify-between items-center w-[320px]">
          <h1 className="text-xl font-bold">Админ-панель</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg text-sm"
          >
            Выйти
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-2xl shadow w-[320px]">
          <h2 className="text-lg font-semibold mb-4">Добавить пользователя</h2>
          <form onSubmit={handleAddUser} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Логин"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              className="p-2 rounded bg-gray-700 border border-gray-600"
            />
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="p-2 rounded bg-gray-700 border border-gray-600"
            />
            <input
              type="text"
              placeholder="Никнейм"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              className="p-2 rounded bg-gray-700 border border-gray-600"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="p-2 rounded bg-gray-700 border border-gray-600"
            >
              <option value="USER">Пользователь</option>
              <option value="ENGINEER">Инженер</option>
              <option value="ADMIN">Администратор</option>
            </select>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 py-2 rounded"
            >
              Добавить
            </button>
          </form>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="w-[400px] space-y-4">
  <h2 className="text-lg font-semibold">Пользователи</h2>
  {users.map((user) => (
    <div
      key={user.id}
      className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow flex flex-col gap-1"
    >
      <div>
        <span className="text-sm text-gray-400">Логин:</span> {user.login}
      </div>
      <div>
        <span className="text-sm text-gray-400">Никнейм:</span> {user.nickname || '—'}
      </div>
      <div>
        <span className="text-sm text-gray-400">Роль:</span> {user.role}
      </div>
      <button
        onClick={() => handleDeleteUser(user.id)}
        className="mt-2 self-end bg-red-500 hover:bg-red-600 text-sm px-3 py-1 rounded-md"
      >
        Удалить
      </button>
    </div>
  ))}
</div>
      </div>
    </div>
  );
};

export default AdminPage;
