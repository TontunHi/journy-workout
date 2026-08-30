import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MuscleGroup } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const muscleGroup = searchParams.get('muscleGroup') as MuscleGroup | null;

    const exercises = await prisma.exercise.findMany({
      where: muscleGroup ? { muscleGroup } : undefined,
      orderBy: { name: 'asc' },
    });

    return Response.json({ data: exercises });
  } catch {
    return Response.json({ error: 'Failed to fetch exercises' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, muscleGroup } = body;

    const exercise = await prisma.exercise.create({
      data: {
        name,
        muscleGroup,
        isPreset: false, // Custom exercises created by users are not preset
      },
    });

    return Response.json({ data: exercise }, { status: 201 });
  } catch {
    return Response.json({ error: 'Failed to create exercise' }, { status: 500 });
  }
}
