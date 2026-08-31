import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const goals = await prisma.nutritionGoal.findFirst();
    return Response.json({ data: goals });
  } catch (error) {
    console.error('Failed to fetch nutrition goals:', error);
    return Response.json({ error: 'Failed to fetch nutrition goals' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { dailyCalories, dailyProtein, dailyCarbs, dailyFat, targetWeight } = body;

    const existingGoal = await prisma.nutritionGoal.findFirst();

    const dataPayload: {
      dailyCalories?: number;
      dailyProtein?: number;
      dailyCarbs?: number;
      dailyFat?: number;
      targetWeight?: number | null;
    } = {};

    if (dailyCalories !== undefined) dataPayload.dailyCalories = parseInt(dailyCalories.toString(), 10);
    if (dailyProtein !== undefined) dataPayload.dailyProtein = parseFloat(dailyProtein.toString());
    if (dailyCarbs !== undefined) dataPayload.dailyCarbs = parseFloat(dailyCarbs.toString());
    if (dailyFat !== undefined) dataPayload.dailyFat = parseFloat(dailyFat.toString());
    if (targetWeight !== undefined) dataPayload.targetWeight = targetWeight ? parseFloat(targetWeight.toString()) : null;

    let goal;
    if (existingGoal) {
      goal = await prisma.nutritionGoal.update({
        where: { id: existingGoal.id },
        data: dataPayload,
      });
    } else {
      goal = await prisma.nutritionGoal.create({
        data: {
          dailyCalories: dataPayload.dailyCalories || 2000,
          dailyProtein: dataPayload.dailyProtein || 150,
          dailyCarbs: dataPayload.dailyCarbs || 250,
          dailyFat: dataPayload.dailyFat || 65,
          targetWeight: dataPayload.targetWeight || 75.0,
        },
      });
    }

    return Response.json({ data: goal });
  } catch (error) {
    console.error('Failed to update nutrition goals:', error);
    return Response.json({ error: 'Failed to update nutrition goals' }, { status: 500 });
  }
}
