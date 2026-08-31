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
  } catch (error) {
    console.error('Failed to fetch body weight logs:', error);
    return Response.json({ error: 'Failed to fetch body weight logs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, weight } = body;

    const parsedWeight = parseFloat(weight?.toString() || '0');
    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      return Response.json({ error: 'Invalid weight value' }, { status: 400 });
    }

    const inputDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(inputDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(inputDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Try to find an existing entry for today
    const existing = await prisma.bodyWeight.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    let entry;
    if (existing) {
      entry = await prisma.bodyWeight.update({
        where: { id: existing.id },
        data: { weight: parsedWeight, date: inputDate },
      });
    } else {
      entry = await prisma.bodyWeight.create({
        data: {
          date: inputDate,
          weight: parsedWeight,
        },
      });
    }

    return Response.json({ data: entry });
  } catch (error) {
    console.error('Failed to log body weight:', error);
    return Response.json({ error: 'Failed to log body weight' }, { status: 500 });
  }
}
