/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const nutrition = await prisma.nutritionEntry.findMany({
      where: { date: { gte: startDate } },
    });

    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    nutrition.forEach((n: any) => {
      totalProtein += n.protein || 0;
      totalCarbs += n.carbs || 0;
      totalFats += n.fat || 0;
    });

    // Format for Nivo pie chart
    const data = [
      { id: 'Protein', label: 'Protein', value: Math.round(totalProtein) },
      { id: 'Carbs', label: 'Carbs', value: Math.round(totalCarbs) },
      { id: 'Fat', label: 'Fat', value: Math.round(totalFats) },
    ];

    return Response.json({ data });
  } catch {
    return Response.json({ error: 'Failed to fetch macros stats' }, { status: 500 });
  }
}
