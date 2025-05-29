import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ApplicationStatus } from '@prisma/client'; // 👈 Импорт enum

// GET /api/user/applications — получить заявки текущего пользователя
export async function GET(req: NextRequest) {
  // Получаем сессию
  const session = await getServerSession(authOptions);

  // Проверяем, авторизован ли пользователь
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    // Получаем заявки пользователя
    const applications = await prisma.application.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        engineer: true, // Если хотите показывать имя инженера
      },
    });

    // Если заявок нет, отправляем пустой массив
    return NextResponse.json(applications);

    // Возвращаем список заявок
    return NextResponse.json(applications);
  } catch (error) {
    // Логирование ошибки
    console.error('Ошибка при получении заявок:', error);

    // Проверка, является ли ошибка Prisma
    if (error instanceof Error && error.message.includes('Prisma')) {
      return NextResponse.json({ error: 'Ошибка при обращении к базе данных' }, { status: 500 });
    }

    // Общая ошибка при выполнении запроса
    return NextResponse.json({ error: 'Неизвестная ошибка' }, { status: 500 });
  }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
  
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Неавторизован' }, { status: 401 });
    }
  
    try {
      const { content, title } = await req.json();
  
      if (!content || !title) {
        return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 });
      }
  
      const newApp = await prisma.application.create({
        data: {
          content,
          title,
          userId: session.user.id,
          status: 'PENDING',
        },
      });
  
      return NextResponse.json(newApp);
    } catch (err) {
      console.error('Ошибка при создании заявки:', err);
      return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
  }

  export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Неавторизован' }, { status: 401 });
  }

  try {
    const { id, status } = await req.json();

    // Разрешаем только статусы "UNDER_REVIEW" и "CLOSED"
    const allowedStatuses = [ApplicationStatus.UNDER_REVIEW, ApplicationStatus.CLOSED];
    
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Недопустимый статус' }, { status: 403 });
    }

    const existing = await prisma.application.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Заявка не найдена или нет доступа' }, { status: 404 });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { status }, // Используем статус, переданный в запросе
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('[USER_PATCH]', err);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}