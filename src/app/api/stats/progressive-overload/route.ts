/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let exerciseId = searchParams.get('exerciseId');
    const days = parseInt(searchParams.get('days') || '90');

    if (!exerciseId) {
      const firstEx = await prisma.exercise.findFirst({
        where: { name: 'Bench Press' }
      }) || await prisma.exercise.findFirst();
      if (firstEx) {
        exerciseId = firstEx.id;
      } else {
        return Response.json({ error: 'Exercise ID is required' }, { status: 400 });
      }
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sets = await prisma.workoutSet.findMany({
      where: {
        exerciseId,
        session: { date: { gte: startDate } }
      },
      include: {
        session: true
      },
      orderBy: { session: { date: 'asc' } }
    });

    const groupedData: Record<string, number> = {};
    sets.forEach((set: any) => {
        const dateStr = set.session.date.toISOString().split('T')[0];
        groupedData[dateStr] = Math.max(groupedData[dateStr] || 0, set.weight);
    });

    const chartData = Object.entries(groupedData).map(([x, y]) => ({ x, y })).filter((d: any) => d.y > 0);

    // Format for Nivo line chart
    const data = [{ id: 'Max Weight', data: chartData }];

    return Response.json({ data });
  } catch {
    return Response.json({ error: 'Failed to fetch progressive overload stats' }, { status: 500 });
  }
}
