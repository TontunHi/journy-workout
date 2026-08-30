import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const goals = await prisma.nutritionGoal.findFirst();
    return Response.json({ data: goals });
  } catch {
    return Response.json({ error: 'Failed to fetch nutrition goals' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { dailyCalories, dailyProtein, dailyCarbs, dailyFat } = body;

    const existingGoal = await prisma.nutritionGoal.findFirst();

    let goal;
    if (existingGoal) {
      goal = await prisma.nutritionGoal.update({
        where: { id: existingGoal.id },
        data: { dailyCalories, dailyProtein, dailyCarbs, dailyFat },
      });
    } else {
      goal = await prisma.nutritionGoal.create({
        data: { dailyCalories, dailyProtein, dailyCarbs, dailyFat },
      });
    }

    return Response.json({ data: goal });
  } catch {
    return Response.json({ error: 'Failed to update nutrition goals' }, { status: 500 });
  }
}
