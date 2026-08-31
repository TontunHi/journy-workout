import { prisma } from "../src/lib/prisma";

async function clearExercises() {
  await prisma.workoutSet.deleteMany();
  await prisma.personalRecord.deleteMany();
  const deleted = await prisma.exercise.deleteMany();
  console.log(`✅ Successfully deleted all ${deleted.count} exercises from NeonDB.`);
}

clearExercises()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
