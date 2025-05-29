import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Тип для параметров маршрута
type RouteParams = {
  params: {
    id: string;
  };
};

// Валидация applicationId
const validateApplicationId = async (id: string) => {
  if (!id || typeof id !== 'string') {
    throw new Error('Неверный ID заявки');
  }
  
  const application = await prisma.application.findUnique({
    where: { id },
  });

  if (!application) {
    throw new Error('Заявка не найдена');
  }

  return id;
};

// GET: Получение сообщений
export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const applicationId = await validateApplicationId(params.id);

    const messages = await prisma.message.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: { select: { login: true, nickname: true } },
        engineer: { select: { login: true, nickname: true } },
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('[CHAT_GET]', error);
    const message = error instanceof Error ? error.message : 'Ошибка при загрузке сообщений';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: Отправка сообщения
export async function POST(
  req: NextRequest,
  { params }: RouteParams
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Требуется авторизация' },
      { status: 401 }
    );
  }

  try {
    const applicationId = await validateApplicationId(params.id);
    const { content } = await req.json();

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Сообщение не может быть пустым' },
        { status: 400 }
      );
    }

    // Проверяем, является ли пользователь инженером
    const isEngineer = session.user.role === 'ENGINEER';
    
    const newMessage = await prisma.message.create({
      data: {
        content: content.trim(),
        userId: isEngineer ? undefined : session.user.id,
        engineerId: isEngineer ? session.user.id : undefined,
        applicationId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: { select: { login: true, nickname: true } },
        engineer: { select: { login: true, nickname: true } },
      },
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('[CHAT_POST]', error);
    const message = error instanceof Error ? error.message : 'Внутренняя ошибка сервера';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
