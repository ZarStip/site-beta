'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Chat from '@/components/Chat';
import { signOut } from 'next-auth/react';
import { ApplicationStatus } from '@prisma/client'; // Импортируем enum ApplicationStatus

type Application = {
  id: string;
  title?: string;
  content: string;
  status: ApplicationStatus;
  user: {
    login: string;
    nickname?: string;
    id: string;
  };
};

const EngineerPage = () => {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [engineerId, setEngineerId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>([]); // Состояние для развернутых заявок

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/engineer/applications');
      if (!res.ok) throw new Error('Ошибка загрузки заявок');
      const data = await res.json();
      setApplications(data);
    } catch (err: any) {
      setError(err.message || 'Неизвестная ошибка');
    }
  };

  useEffect(() => {
    fetchApplications();
    setEngineerId('engineer-123'); // Временно, пока не будет авторизации
  }, []);

  const updateStatus = async (id: string, status: ApplicationStatus) => {
    try {
      const res = await fetch('/api/engineer/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error('Ошибка обновления статуса');
      await fetchApplications();
    } catch (err: any) {
      setError(err.message || 'Ошибка');
    }
  };

  const handleToggleArchive = () => {
    setShowArchived((prev) => !prev);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    );
  };

  if (!engineerId) {
    return <p>Загрузка...</p>;
  }

  const activeApplications = applications.filter(
    (app) =>
      app.status === ApplicationStatus.PENDING || app.status === ApplicationStatus.UNDER_REVIEW
  );
  const archivedApplications = applications.filter(
    (app) => app.status === ApplicationStatus.CLOSED
  );

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Инженер – Заявки</h1>
        <button 
          onClick={handleLogout}
          className="text-red-500 hover:text-red-700"
        >
          Выйти
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <button
        onClick={handleToggleArchive}
        className="mb-4 text-blue-500 hover:text-blue-700"
      >
        {showArchived ? 'Показать активные заявки' : 'Показать архивные заявки'}
      </button>

      <h2 className="text-xl mb-4">{showArchived ? 'Архив заявок' : 'Активные заявки'}</h2>
      <div className="space-y-6">
        {(showArchived ? archivedApplications : activeApplications).map((app) => (
          <div
            key={app.id}
            className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <p className="font-semibold">{app.title}</p>
              </div>

              <div className="flex space-x-2 items-center">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  onClick={() => toggleExpand(app.id)}
                >
                  {expandedIds.includes(app.id) ? 'Свернуть' : 'Развернуть'}
                </button>

                {app.status === ApplicationStatus.PENDING && (
                  <>
                    <button
                      onClick={() => updateStatus(app.id, ApplicationStatus.UNDER_REVIEW)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                    >
                      Принять
                    </button>
                    <button
                      onClick={() => updateStatus(app.id, ApplicationStatus.CLOSED)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                    >
                      Закрыть
                    </button>
                  </>
                )}

                {app.status === ApplicationStatus.UNDER_REVIEW && (
                  <button
                    onClick={() => updateStatus(app.id, ApplicationStatus.CLOSED)}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                  >
                    Закрыть
                  </button>
                )}
              </div>
            </div>

            <div className="mt-2">
              <p className="text-gray-500"><strong>Статус:</strong> {app.status}</p>
            </div>

            {/* Разворачиваемое содержимое */}
            {expandedIds.includes(app.id) && (
              <div className="mt-4">
                <p className="text-gray-400">{app.content}</p>
                <p className="text-gray-300 mt-2">
                  <strong>Пользователь:</strong> {app.user.nickname || app.user.login}
                </p>
                <Chat
  applicationId={app.id}
  userId={app.user.id}
  engineerId={engineerId}
  isClosed={app.status === ApplicationStatus.CLOSED}
/>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EngineerPage;
