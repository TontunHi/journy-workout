import { prisma } from "../src/lib/prisma";

async function test() {
  const date = new Date();
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const existing = await prisma.bodyWeight.findFirst({
    where: { date: { gte: startOfDay, lte: endOfDay } }
  });

  if (existing) {
    const updated = await prisma.bodyWeight.update({
      where: { id: existing.id },
      data: { weight: 76.2 }
    });
    console.log("✅ Updated today weight entry successfully:", updated);
  } else {
    const created = await prisma.bodyWeight.create({
      data: { date, weight: 76.2 }
    });
    console.log("✅ Created today weight entry successfully:", created);
  }
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
