import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const prs = await prisma.personalRecord.findMany({
      orderBy: {
        date: 'desc',
      },
    });

    return Response.json({ data: prs });
  } catch {
    return Response.json({ error: 'Failed to fetch personal records' }, { status: 500 });
  }
}
