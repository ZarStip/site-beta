// /app/api/admin/users/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();  // Получаем id из пути

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  await prisma.user.delete({
    where: { id: String(id) },  // Преобразуем id в строку
  });

  return NextResponse.json({ message: 'User deleted' });
}
