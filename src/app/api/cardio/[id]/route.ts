import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await prisma.cardioSession.findUnique({
      where: { id },
    });

    if (!session) {
      return Response.json({ error: 'Cardio session not found' }, { status: 404 });
    }

    return Response.json({ data: session });
  } catch {
    return Response.json({ error: 'Failed to fetch cardio session' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { date, type, duration, distance, caloriesBurned, notes } = body;

    const session = await prisma.cardioSession.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        type,
        duration,
        distance,
        caloriesBurned,
        notes,
      },
    });

    return Response.json({ data: session });
  } catch {
    return Response.json({ error: 'Failed to update cardio session' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.cardioSession.delete({
      where: { id },
    });

    return Response.json({ data: { success: true } });
  } catch {
    return Response.json({ error: 'Failed to delete cardio session' }, { status: 500 });
  }
}
