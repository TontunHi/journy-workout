import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '90');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const weights = await prisma.bodyWeight.findMany({
      where: { date: { gte: startDate } },
      orderBy: { date: 'asc' }
    });

    const chartData = weights.map(w => ({
      x: w.date.toISOString().split('T')[0],
      y: w.weight
    }));

    // Format for Nivo line chart
    const data = [{ id: 'Body Weight', data: chartData }];

    return Response.json({ data });
  } catch {
    return Response.json({ error: 'Failed to fetch body weight trend stats' }, { status: 500 });
  }
}
