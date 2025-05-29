// app/types/next-auth.d.ts

import { DefaultSession } from 'next-auth';

// Расширяем типы User и Session для использования кастомных полей
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      login: string;
      role: string;
      // Можно добавить другие поля, если они есть
    } & DefaultSession['user']; // Чтобы сохранить стандартные поля из session.user (email, image)
  }

  interface User {
    id: string;
    login: string;
    role: string;
    // Можно добавить другие поля, если они есть
  }
}
