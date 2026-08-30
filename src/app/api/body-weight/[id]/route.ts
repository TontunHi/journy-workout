import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.bodyWeight.delete({
      where: { id },
    });

    return Response.json({ data: { success: true } });
  } catch {
    return Response.json({ error: 'Failed to delete body weight entry' }, { status: 500 });
  }
}
