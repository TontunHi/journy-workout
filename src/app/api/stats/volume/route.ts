import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MuscleGroup } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const weeks = parseInt(searchParams.get('weeks') || '8');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (weeks * 7));

    const sessions = await prisma.workoutSession.findMany({
      where: { date: { gte: startDate } },
      include: {
        sets: {
          include: {
            exercise: true
          }
        }
      },
      orderBy: { date: 'asc' }
    });

    // Group volume by week and muscle group
    const weeklyData: Record<string, Record<string, string | number>> = {};
    
    sessions.forEach(session => {
      // Simple week key logic (e.g., '2024-W01') could be more robust
      const weekKey = `Week ${getWeekNumber(session.date)}`;
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { period: weekKey };
        Object.values(MuscleGroup).forEach(mg => weeklyData[weekKey][mg] = 0);
      }

      session.sets.forEach((set) => {
        const volume = (set.weight ?? 0) * set.reps;
        const mg = set.exercise.muscleGroup;
        if (mg && weeklyData[weekKey][mg] !== undefined) {
          (weeklyData[weekKey][mg] as number) += volume;
        }
      });
    });

    // Format for Nivo bar chart
    const data = Object.values(weeklyData);

    return Response.json({ data });
  } catch {
    return Response.json({ error: 'Failed to fetch volume stats' }, { status: 500 });
  }
}

function getWeekNumber(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
}
