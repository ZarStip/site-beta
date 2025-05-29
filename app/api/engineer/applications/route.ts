import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ApplicationStatus } from '@prisma/client'; // Импортируем enum статусов

// Получить все заявки
export async function GET() {
  try {
    const applications = await prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { login: true, nickname: true }, // Информация о пользователе
        },
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('[ENGINEER_GET]', error);
    return NextResponse.json({ error: 'Ошибка при загрузке заявок' }, { status: 500 });
  }
}

// Обновить статус заявки (Принять/Закрыть)
export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
  
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }
  
    try {
      const { id, status } = await req.json();
  
      const allowedStatuses = [ApplicationStatus.UNDER_REVIEW, ApplicationStatus.CLOSED];
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json({ error: 'Недопустимый статус' }, { status: 403 });
      }
  
      const existing = await prisma.application.findUnique({
        where: { id },
      });
  
      if (!existing) {
        return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
      }
  
      // Обновляем заявку, устанавливая статус и id инженера, если нужно
      const updated = await prisma.application.update({
        where: { id },
        data: {
          status,
          engineerId: existing.engineerId ?? session.user.id, // Присваиваем инженера, если он ещё не назначен
        },
      });
  
      return NextResponse.json(updated);
    } catch (err) {
      console.error('[ENGINEER_PATCH]', err);
      return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
  }