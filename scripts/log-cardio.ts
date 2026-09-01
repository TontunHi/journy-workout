import { prisma } from "../src/lib/prisma";
import { updateStreak } from "../src/lib/streak";

async function logCardio() {
  const cardio = await prisma.cardioSession.create({
    data: {
      type: "TREADMILL",
      date: new Date(),
      duration: 15,
      distance: 1.2,
      caloriesBurned: 30,
      notes: "Treadmill 15min",
    },
  });

  const streak = await updateStreak("WORKOUT");

  console.log("✅ Cardio Session Saved to NeonDB:");
  console.log(cardio);
  console.log("🔥 Updated Workout Streak:", streak);
}

logCardio()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
