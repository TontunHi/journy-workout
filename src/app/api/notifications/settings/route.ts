import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.notificationSetting.findMany();
    return Response.json({ data: settings });
  } catch {
    return Response.json({ error: 'Failed to fetch notification settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, enabled, time } = body;

    // Check if setting exists, if not create it, else update
    const existing = await prisma.notificationSetting.findUnique({
      where: { type },
    });

    let setting;
    if (existing) {
      setting = await prisma.notificationSetting.update({
        where: { type },
        data: { enabled, time },
      });
    } else {
      setting = await prisma.notificationSetting.create({
        data: { type, enabled, time },
      });
    }

    return Response.json({ data: setting });
  } catch {
    return Response.json({ error: 'Failed to update notification setting' }, { status: 500 });
  }
}
