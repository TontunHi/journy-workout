import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MealType } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    
    let targetDate = new Date();
    if (dateParam) {
      targetDate = new Date(dateParam);
    }
    
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const [entries, goals] = await Promise.all([
      prisma.nutritionEntry.findMany({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
      prisma.nutritionGoal.findFirst(),
    ]);

    return Response.json({ data: entries, goals });
  } catch {
    return Response.json({ error: 'Failed to fetch nutrition entries' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, mealType, foodName, calories, protein, carbs, fat, photoUrl, notes } = body;

    const entry = await prisma.nutritionEntry.create({
      data: {
        date: date ? new Date(date) : new Date(),
        mealType: mealType as MealType,
        foodName,
        calories: parseInt(calories.toString(), 10),
        protein: protein ? parseFloat(protein.toString()) : null,
        carbs: carbs ? parseFloat(carbs.toString()) : null,
        fat: fat ? parseFloat(fat.toString()) : null,
        photoUrl: photoUrl || null,
        notes: notes || null,
      },
    });

    return Response.json({ data: entry }, { status: 201 });
  } catch {
    return Response.json({ error: 'Failed to create nutrition entry' }, { status: 500 });
  }
}
