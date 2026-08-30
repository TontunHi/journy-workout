import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fromStr = searchParams.get('from');
    const toStr = searchParams.get('to');

    const where: import('@prisma/client').Prisma.BodyWeightWhereInput = {};
    if (fromStr || toStr) {
      where.date = {};
      if (fromStr) where.date.gte = new Date(new Date(fromStr).setHours(0, 0, 0, 0));
      if (toStr) where.date.lt = new Date(new Date(toStr).setHours(23, 59, 59, 999));
    }

    const weights = await prisma.bodyWeight.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    return Response.json({ data: weights });
  } catch {
    return Response.json({ error: 'Failed to fetch body weight logs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, weight } = body;
    const inputDate = new Date(date);
    const startOfDay = new Date(inputDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(inputDate.setHours(23, 59, 59, 999));

    // Try to find an existing entry for this date
    const existing = await prisma.bodyWeight.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    let entry;
    if (existing) {
      entry = await prisma.bodyWeight.update({
        where: { id: existing.id },
        data: { weight, date: new Date(date) },
      });
    } else {
      entry = await prisma.bodyWeight.create({
        data: {
          date: new Date(date),
          weight,
        },
      });
    }

    return Response.json({ data: entry });
  } catch {
    return Response.json({ error: 'Failed to log body weight' }, { status: 500 });
  }
}
