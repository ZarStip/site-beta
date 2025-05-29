'use client';

import React, { useEffect, useState } from 'react';

type Message = {
  id: string;
  content: string;
  createdAt: string;
  user: { login: string; nickname?: string } | null;
  engineer: { login: string; nickname?: string } | null;
};

type ChatProps = {
  applicationId: string;
  userId: string;
  engineerId?: string;
  isClosed?: boolean; // <- добавили сюда
};

const Chat: React.FC<ChatProps> = ({ applicationId, userId, engineerId, isClosed }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/engineer/applications/${applicationId}/chat`);
      if (!res.ok) throw new Error('Ошибка загрузки сообщений');
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('Ошибка при загрузке сообщений:', err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isClosed) return;

    try {
      const res = await fetch(`/api/engineer/applications/${applicationId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          userId,
          engineerId,
        }),
      });
      if (!res.ok) throw new Error('Ошибка при отправке сообщения');
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      console.error('Ошибка при отправке сообщения:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [applicationId]);

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-2">Чат по заявке</h2>
      <div className="space-y-2 max-h-60 overflow-y-auto bg-gray-700 p-4 rounded-lg">
        {messages.map((msg) => (
          <div key={msg.id} className="text-sm text-gray-300">
            <strong>
              {msg.user?.nickname || msg.user?.login || msg.engineer?.nickname || msg.engineer?.login || 'Аноним'}
            </strong>
            : {msg.content}
          </div>
        ))}
      </div>

      <div className="mt-2 flex flex-col space-y-2">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={isClosed ? 'Заявка закрыта — чат недоступен' : 'Напишите сообщение'}
          disabled={isClosed}
          className="bg-gray-800 text-white p-2 rounded-md resize-none h-24 disabled:opacity-50"
        />
        <button
          onClick={sendMessage}
          disabled={isClosed}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Отправить
        </button>
      </div>
    </div>
  );
};

export default Chat;
