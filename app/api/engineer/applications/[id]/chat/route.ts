import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// ✅ GET-запрос — получение сообщений по заявке
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Ожидаем, пока будут доступны параметры
    const { id } = await context.params;

    const applicationId = id;

    const messages = await prisma.message.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { login: true, nickname: true } },
        engineer: { select: { login: true, nickname: true } },
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('[CHAT_GET]', error);
    return NextResponse.json({ error: 'Ошибка при загрузке сообщений' }, { status: 500 });
  }
}

// ✅ POST-запрос — отправка нового сообщения
export async function POST(req: NextRequest, context: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { id } = await context.params;
  const applicationId = id;

  try {
    const { content } = await req.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Сообщение не может быть пустым' }, { status: 400 });
    }

    const newMessage = await prisma.message.create({
      data: {
        content,
        userId: session.user.id,
        applicationId,
        engineerId: null, // Убедитесь, что если у сообщения нет инженера, это поле null
      },
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании сообщения:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
