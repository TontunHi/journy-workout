/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateStreak } from '@/lib/streak';
import { checkSessionForPRs } from '@/lib/pr-detector';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const dateStr = searchParams.get('date');
    const skip = (page - 1) * limit;

    const where = dateStr
      ? {
          date: {
            gte: new Date(new Date(dateStr).setHours(0, 0, 0, 0)),
            lt: new Date(new Date(dateStr).setHours(23, 59, 59, 999)),
          },
        }
      : {};

    const [workouts, total] = await Promise.all([
      prisma.workoutSession.findMany({
        where,
        include: {
          sets: {
            include: {
              exercise: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.workoutSession.count({ where }),
    ]);

    return Response.json({
      data: workouts,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return Response.json({ error: 'Failed to fetch workouts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, duration, notes, exercises } = body;

    const session = await prisma.workoutSession.create({
      data: {
        date: new Date(date),
        duration,
        notes,
        sets: {
          create: exercises.flatMap((ex: any) => 
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
        sets: {
          include: { exercise: true },
        },
      },
    });

    // Update streak and check PRs
    await updateStreak('WORKOUT');
    
    // Gather all sets for PR detection
    const allSets = session.sets;
    if (allSets.length > 0) {
      await checkSessionForPRs(allSets);
    }

    return Response.json({ data: session }, { status: 201 });
  } catch {
    return Response.json({ error: 'Failed to create workout' }, { status: 500 });
  }
}
