/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint, p256dh, auth } = body;

    const pushSubscription = {
      endpoint,
      keys: {
        p256dh,
        auth,
      },
    };

    // Update all existing settings with the new subscription
    await prisma.notificationSetting.updateMany({
      data: {
        pushSubscription: pushSubscription as any,
      },
    });

    const subscription = pushSubscription;

    return Response.json({ data: subscription }, { status: 201 });
  } catch {
    return Response.json({ error: 'Failed to save push subscription' }, { status: 500 });
  }
}
