import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const entry = await prisma.nutritionEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      return Response.json({ error: 'Nutrition entry not found' }, { status: 404 });
    }

    return Response.json({ data: entry });
  } catch {
    return Response.json({ error: 'Failed to fetch nutrition entry' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { date, mealType, foodName, calories, protein, carbs, fat, notes } = body;

    const entry = await prisma.nutritionEntry.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        mealType,
        foodName,
        calories,
        protein,
        carbs,
        fat,
        notes,
      },
    });

    return Response.json({ data: entry });
  } catch {
    return Response.json({ error: 'Failed to update nutrition entry' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.nutritionEntry.delete({
      where: { id },
    });

    return Response.json({ data: { success: true } });
  } catch {
    return Response.json({ error: 'Failed to delete nutrition entry' }, { status: 500 });
  }
}
