/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await prisma.workoutSession.findUnique({
      where: { id },
      include: {
        sets: {
          include: {
            exercise: true,
          },
          orderBy: { setNumber: 'asc' },
        },
      },
    });

    if (!session) {
      return Response.json({ error: 'Workout session not found' }, { status: 404 });
    }

    return Response.json({ data: session });
  } catch {
    return Response.json({ error: 'Failed to fetch workout session' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { date, duration, notes, exercises } = body;

    // First delete existing sets for this session
    // and then re-create them.
    await prisma.workoutSet.deleteMany({
      where: { sessionId: id },
    });

    const session = await prisma.workoutSession.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        duration,
        notes,
        sets: {
          create: exercises?.flatMap((ex: any) => 
            ex.sets.map((set: any) => ({
              exerciseId: ex.exerciseId,
              setNumber: set.setNumber,
              reps: set.reps,
              weight: set.weight,
              notes: set.notes,
            }))
          ),
        },
      },
      include: {
        sets: { include: { exercise: true } },
      },
    });

    return Response.json({ data: session });
  } catch {
    return Response.json({ error: 'Failed to update workout session' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    await prisma.workoutSession.delete({
      where: { id },
    });

    return Response.json({ data: { success: true } });
  } catch {
    return Response.json({ error: 'Failed to delete workout session' }, { status: 500 });
  }
}
