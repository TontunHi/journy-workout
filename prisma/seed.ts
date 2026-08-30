import { PrismaClient, MuscleGroup } from "@prisma/client";

const prisma = new PrismaClient();

const presetExercises = [
  // Chest
  { name: "Bench Press", muscleGroup: MuscleGroup.CHEST },
  { name: "Incline Bench Press", muscleGroup: MuscleGroup.CHEST },
  { name: "Dumbbell Fly", muscleGroup: MuscleGroup.CHEST },
  { name: "Cable Crossover", muscleGroup: MuscleGroup.CHEST },
  { name: "Chest Dip", muscleGroup: MuscleGroup.CHEST },
  { name: "Push-up", muscleGroup: MuscleGroup.CHEST },

  // Back
  { name: "Deadlift", muscleGroup: MuscleGroup.BACK },
  { name: "Barbell Row", muscleGroup: MuscleGroup.BACK },
  { name: "Lat Pulldown", muscleGroup: MuscleGroup.BACK },
  { name: "Seated Cable Row", muscleGroup: MuscleGroup.BACK },
  { name: "Pull-up", muscleGroup: MuscleGroup.BACK },
  { name: "T-Bar Row", muscleGroup: MuscleGroup.BACK },

  // Legs
  { name: "Squat", muscleGroup: MuscleGroup.LEGS },
  { name: "Leg Press", muscleGroup: MuscleGroup.LEGS },
  { name: "Leg Curl", muscleGroup: MuscleGroup.LEGS },
  { name: "Leg Extension", muscleGroup: MuscleGroup.LEGS },
  { name: "Calf Raise", muscleGroup: MuscleGroup.LEGS },
  { name: "Romanian Deadlift", muscleGroup: MuscleGroup.LEGS },
  { name: "Lunge", muscleGroup: MuscleGroup.LEGS },
  { name: "Hack Squat", muscleGroup: MuscleGroup.LEGS },

  // Arms
  { name: "Barbell Curl", muscleGroup: MuscleGroup.ARMS },
  { name: "Dumbbell Curl", muscleGroup: MuscleGroup.ARMS },
  { name: "Hammer Curl", muscleGroup: MuscleGroup.ARMS },
  { name: "Tricep Extension", muscleGroup: MuscleGroup.ARMS },
  { name: "Tricep Pushdown", muscleGroup: MuscleGroup.ARMS },
  { name: "Skull Crusher", muscleGroup: MuscleGroup.ARMS },
  { name: "Preacher Curl", muscleGroup: MuscleGroup.ARMS },

  // Shoulders
  { name: "Overhead Press", muscleGroup: MuscleGroup.SHOULDERS },
  { name: "Lateral Raise", muscleGroup: MuscleGroup.SHOULDERS },
  { name: "Front Raise", muscleGroup: MuscleGroup.SHOULDERS },
  { name: "Face Pull", muscleGroup: MuscleGroup.SHOULDERS },
  { name: "Arnold Press", muscleGroup: MuscleGroup.SHOULDERS },
  { name: "Reverse Fly", muscleGroup: MuscleGroup.SHOULDERS },

  // Core
  { name: "Plank", muscleGroup: MuscleGroup.CORE },
  { name: "Crunch", muscleGroup: MuscleGroup.CORE },
  { name: "Russian Twist", muscleGroup: MuscleGroup.CORE },
  { name: "Hanging Leg Raise", muscleGroup: MuscleGroup.CORE },
  { name: "Ab Rollout", muscleGroup: MuscleGroup.CORE },
  { name: "Cable Woodchop", muscleGroup: MuscleGroup.CORE },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing preset exercises
  await prisma.exercise.deleteMany({ where: { isPreset: true } });

  // Seed exercises
  for (const exercise of presetExercises) {
    await prisma.exercise.create({
      data: {
        ...exercise,
        isPreset: true,
      },
    });
  }
  console.log(`✅ Seeded ${presetExercises.length} preset exercises`);

  // Seed default nutrition goal (upsert)
  await prisma.nutritionGoal.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      dailyCalories: 2000,
      dailyProtein: 150,
      dailyCarbs: 250,
      dailyFat: 65,
    },
  });
  console.log("✅ Seeded default nutrition goal");

  // Seed streaks
  for (const type of ["WORKOUT", "NUTRITION"] as const) {
    await prisma.streak.upsert({
      where: { type },
      update: {},
      create: { type, currentStreak: 0, longestStreak: 0 },
    });
  }
  console.log("✅ Seeded streak records");

  // Seed notification settings
  const notifTypes = [
    "WORKOUT_REMINDER",
    "MEAL_REMINDER",
    "STREAK_WARNING",
    "DAILY_SUMMARY",
    "PR_ALERT",
  ] as const;

  for (const type of notifTypes) {
    await prisma.notificationSetting.upsert({
      where: { type },
      update: {},
      create: {
        type,
        enabled: false,
        time: type === "WORKOUT_REMINDER" ? "18:00" : type === "MEAL_REMINDER" ? "12:00" : type === "DAILY_SUMMARY" ? "21:00" : null,
      },
    });
  }
  console.log("✅ Seeded notification settings");

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
