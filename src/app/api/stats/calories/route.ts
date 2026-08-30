/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'week'; // week or month
    const days = period === 'month' ? 30 : 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const nutrition = await prisma.nutritionEntry.findMany({
      where: { date: { gte: startDate } },
      orderBy: { date: 'asc' }
    });

    const goals = await prisma.nutritionGoal.findFirst();

    // Group by date
    const dailyData: Record<string, number> = {};
    nutrition.forEach((n: any) => {
      const dateStr = n.date.toISOString().split('T')[0];
      dailyData[dateStr] = (dailyData[dateStr] || 0) + n.calories;
    });

    const chartData = Object.entries(dailyData).map(([date, calories]) => ({
      date,
      calories
    }));

    return Response.json({ data: chartData });
  } catch {
    return Response.json({ error: 'Failed to fetch calories stats' }, { status: 500 });
  }
}
