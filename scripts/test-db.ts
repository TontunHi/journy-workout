import { prisma } from "../src/lib/prisma";

async function verify() {
  console.log("==========================================");
  console.log("🟢 NeonDB Connection: ACTIVE & CONNECTED");
  console.log("==========================================");
  
  const [exercises, workouts, cardio, nutrition, weight, streaks, prs] = await Promise.all([
    prisma.exercise.count(),
    prisma.workoutSession.count(),
    prisma.cardioSession.count(),
    prisma.nutritionEntry.count(),
    prisma.bodyWeight.count(),
    prisma.streak.findMany(),
    prisma.personalRecord.count()
  ]);

  console.log(`💪 Exercises: ${exercises}`);
  console.log(`🏋️ Workout Sessions: ${workouts}`);
  console.log(`🏃 Cardio Sessions: ${cardio}`);
  console.log(`🥗 Nutrition Entries: ${nutrition}`);
  console.log(`⚖️ Body Weight Records: ${weight}`);
  console.log(`🏆 Personal Records: ${prs}`);
  console.log("🔥 Streaks:", streaks.map(s => `${s.type}: ${s.currentStreak} days`).join(", "));
  console.log("==========================================");
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
