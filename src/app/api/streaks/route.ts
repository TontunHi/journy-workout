
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const streaks = await prisma.streak.findMany();
    
    return Response.json({ data: streaks });
  } catch {
    return Response.json({ error: 'Failed to fetch streaks' }, { status: 500 });
  }
}
