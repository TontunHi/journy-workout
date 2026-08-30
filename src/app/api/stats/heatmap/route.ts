import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();
    
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    const [workouts, cardio] = await Promise.all([
      prisma.workoutSession.findMany({
        where: { date: { gte: startDate, lte: endDate } },
        select: { date: true }
      }),
      prisma.cardioSession.findMany({
        where: { date: { gte: startDate, lte: endDate } },
        select: { date: true }
      })
    ]);

    const activityMap: Record<string, number> = {};

    const addToMap = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
    };

    workouts.forEach(w => addToMap(w.date));
    cardio.forEach(c => addToMap(c.date));

    // Format for Nivo calendar heatmap
    const data = Object.entries(activityMap).map(([day, value]) => ({
      day,
      value
    }));

    return Response.json({ data });
  } catch {
    return Response.json({ error: 'Failed to fetch heatmap stats' }, { status: 500 });
  }
}
