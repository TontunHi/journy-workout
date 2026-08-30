import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Do not allow updating preset exercises
    const existing = await prisma.exercise.findUnique({ where: { id } });
    if (!existing) {
      return Response.json({ error: 'Exercise not found' }, { status: 404 });
    }
    if (existing.isPreset) {
      return Response.json({ error: 'Cannot modify preset exercises' }, { status: 403 });
    }

    const { name, muscleGroup } = body;
    const exercise = await prisma.exercise.update({
      where: { id },
      data: { name, muscleGroup },
    });

    return Response.json({ data: exercise });
  } catch {
    return Response.json({ error: 'Failed to update exercise' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const existing = await prisma.exercise.findUnique({ where: { id } });
    if (!existing) {
      return Response.json({ error: 'Exercise not found' }, { status: 404 });
    }
    if (existing.isPreset) {
      return Response.json({ error: 'Cannot delete preset exercises' }, { status: 403 });
    }

    await prisma.exercise.delete({ where: { id } });

    return Response.json({ data: { success: true } });
  } catch {
    return Response.json({ error: 'Failed to delete exercise' }, { status: 500 });
  }
}
