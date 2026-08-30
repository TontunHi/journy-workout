import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CardioType } from '@prisma/client';
import { updateStreak } from '@/lib/streak';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as CardioType | null;
    const dateStr = searchParams.get('date');

    const where: import('@prisma/client').Prisma.CardioSessionWhereInput = {};
    if (type) where.type = type;
    if (dateStr) {
      where.date = {
        gte: new Date(new Date(dateStr).setHours(0, 0, 0, 0)),
        lt: new Date(new Date(dateStr).setHours(23, 59, 59, 999)),
      };
    }

    const cardioSessions = await prisma.cardioSession.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return Response.json({ data: cardioSessions });
  } catch {
    return Response.json({ error: 'Failed to fetch cardio sessions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, type, duration, distance, caloriesBurned, notes } = body;

    const session = await prisma.cardioSession.create({
      data: {
        date: new Date(date),
        type,
        duration,
        distance,
        caloriesBurned,
        notes,
      },
    });

    await updateStreak('WORKOUT');

    return Response.json({ data: session }, { status: 201 });
  } catch {
    return Response.json({ error: 'Failed to create cardio session' }, { status: 500 });
  }
}
