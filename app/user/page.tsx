'use client';

import React, { useEffect, useState } from 'react';
import Chat from '@/components/Chat';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

type Application = {
  id: string;
  title?: string;
  content: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CLOSED';
};

const UserPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [applications, setApplications] = useState<Application[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);  // Стейт для переключения
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null); // Стейт для сворачивания/разворачивания заявок

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/user/applications');
      if (!res.ok) throw new Error('Ошибка загрузки заявок');
      const data = await res.json();
      setApplications(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке заявок');
    }
  };

  const submitApplication = async () => {
    if (!newContent.trim() || !newTitle.trim()) return;
    try {
      const res = await fetch('/api/user/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, content: newContent }),
      });
      if (!res.ok) throw new Error('Ошибка отправки заявки');
      setNewTitle('');
      setNewContent('');
      await fetchApplications();
    } catch (err: any) {
      setError(err.message || 'Ошибка при отправке заявки');
    }
  };

  const closeApplication = async (id: string) => {
    try {
      const res = await fetch('/api/user/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'CLOSED' }),
      });
      if (!res.ok) throw new Error('Не удалось закрыть заявку');
      await fetchApplications();
    } catch (err: any) {
      setError(err.message || 'Ошибка при закрытии заявки');
    }
  };

  const toggleApplicationExpand = (id: string) => {
    setExpandedAppId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchApplications();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status]);

  if (status === 'loading') return <p>Загрузка...</p>;

  const activeApplications = applications.filter((app) => app.status !== 'CLOSED');
  const archivedApplications = applications.filter((app) => app.status === 'CLOSED');

  const handleToggleArchive = () => {
    setShowArchived((prev) => !prev);
  };

  const applicationsToShow = showArchived ? archivedApplications : activeApplications;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Мои заявки</h1>
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-red-500 hover:text-red-700"
        >
          Выйти
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Форма отправки заявки */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-6">
        <h2 className="text-xl mb-4">Новая заявка</h2>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Заголовок заявки"
          className="w-full p-3 mb-4 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Опишите вашу проблему или вопрос"
          className="w-full p-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="mt-4">
          <button
            onClick={submitApplication}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Отправить заявку
          </button>
        </div>
      </div>

      {/* Кнопка для переключения архива */}
      <button
        onClick={handleToggleArchive}
        className="mt-6 mb-4 text-blue-500 hover:text-blue-700"
      >
        {showArchived ? 'Показать активные заявки' : 'Показать архивные заявки'}
      </button>

      {/* Заявки */}
      <div>
        <h2 className="text-xl mb-4">{showArchived ? 'Архив заявок' : 'Активные заявки'}</h2>
        <div className="space-y-6">
          {applicationsToShow.map((app) => (
            <div
              key={app.id}
              className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  {app.status !== 'CLOSED' && (
                    <button
                      onClick={() => closeApplication(app.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                    >
                      Закрыть
                    </button>
                  )}
                  <p className="font-semibold cursor-pointer" onClick={() => toggleApplicationExpand(app.id)}>
                    {app.title}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <em className="text-gray-500">{app.status}</em>
                  <button
                    onClick={() => toggleApplicationExpand(app.id)}
                    className="bg-gray-600 text-white px-2 py-1 rounded-md"
                  >
                    {expandedAppId === app.id ? 'Свернуть' : 'Развернуть'}
                  </button>
                </div>
              </div>
              {expandedAppId === app.id && (
                <div>
                  <p className="text-gray-400 mt-2">{app.content}</p>
                  <Chat
  applicationId={app.id}
  userId={session?.user?.id || ''}
  isClosed={app.status === 'CLOSED'}
/>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserPage;
