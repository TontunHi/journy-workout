/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const [workouts, cardio, nutrition, goals, streaks] = await Promise.all([
      prisma.workoutSession.findMany({
        where: { date: { gte: startOfDay, lt: endOfDay } },
        include: { sets: true }
      }),
      prisma.cardioSession.findMany({
        where: { date: { gte: startOfDay, lt: endOfDay } }
      }),
      prisma.nutritionEntry.findMany({
        where: { date: { gte: startOfDay, lt: endOfDay } }
      }),
      prisma.nutritionGoal.findFirst(),
      prisma.streak.findMany()
    ]);

    const totalCalories = nutrition.reduce((sum: number, item: any) => sum + item.calories, 0);
    const totalProtein = nutrition.reduce((sum: number, item: any) => sum + item.protein, 0);

    const data = {
      todayWorkouts: workouts.length,
      todayCardio: cardio.length,
      nutrition: {
        consumedCalories: totalCalories,
        goalCalories: goals?.dailyCalories || 0,
        consumedProtein: totalProtein,
        goalProtein: goals?.dailyProtein || 0,
      },
      streaks: streaks.map((s: any) => ({ type: s.type, current: s.currentStreak, max: s.longestStreak }))
    };

    return Response.json({ data });
  } catch {
    return Response.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
