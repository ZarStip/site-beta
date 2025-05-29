import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
      const users = await prisma.user.findMany();
      return NextResponse.json(users);
    } catch (err) {
      console.error('Ошибка при получении пользователей:', err);
      return new NextResponse('Ошибка сервера', { status: 500 });
    }
  }

export async function POST(req: Request) {
  const { login, password, nickname, role } = await req.json();

  // Проверка, существует ли уже пользователь с таким логином
  const existingUser = await prisma.user.findUnique({
    where: { login },
  });

  if (existingUser) {
    return NextResponse.json({ error: 'Пользователь с таким логином уже существует' }, { status: 400 });
  }

  // Хеширование пароля
  const hashedPassword = await bcrypt.hash(password, 10);

  // Создание нового пользователя
  const user = await prisma.user.create({
    data: {
      login,
      password: hashedPassword,
      nickname,  // Добавляем никнейм
      role,      // Роль пользователя
    },
  });

  return NextResponse.json(user);
}
