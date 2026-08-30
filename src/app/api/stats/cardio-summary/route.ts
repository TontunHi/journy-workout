import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CardioType } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'week'; // week or month
    const days = period === 'month' ? 30 : 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const cardio = await prisma.cardioSession.findMany({
      where: { date: { gte: startDate } },
    });

    const summaryData: Record<string, { duration: number, distance: number, calories: number }> = {};
    
    Object.values(CardioType).forEach(type => {
        summaryData[type] = { duration: 0, distance: 0, calories: 0 };
    });

    cardio.forEach(c => {
      summaryData[c.type].duration += c.duration;
      summaryData[c.type].distance += (c.distance || 0);
      summaryData[c.type].calories += (c.caloriesBurned || 0);
    });

    // Format for Nivo Bar chart (e.g., duration by type)
    const data = Object.entries(summaryData).map(([type, stats]) => ({
      type,
      ...stats
    }));

    return Response.json({ data });
  } catch {
    return Response.json({ error: 'Failed to fetch cardio summary stats' }, { status: 500 });
  }
}
