import { PrismaClient, MuscleGroup, CardioType, MealType } from "@prisma/client";
import { subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Generating 20x Realistic Historical Mock Data...");

  // Fetch all exercises from DB
  const exercises = await prisma.exercise.findMany();
  if (exercises.length === 0) {
    console.error("No exercises found. Run seed first.");
    return;
  }

  const exerciseMapByMuscle: Record<string, string[]> = {};
  for (const ex of exercises) {
    if (!exerciseMapByMuscle[ex.muscleGroup]) {
      exerciseMapByMuscle[ex.muscleGroup] = [];
    }
    exerciseMapByMuscle[ex.muscleGroup].push(ex.id);
  }

  // Clear existing logs
  console.log("Cleaning old sessions, logs and entries...");
  await prisma.workoutSet.deleteMany();
  await prisma.workoutSession.deleteMany();
  await prisma.cardioSession.deleteMany();
  await prisma.nutritionEntry.deleteMany();
  await prisma.bodyWeight.deleteMany();
  await prisma.personalRecord.deleteMany();

  const totalDays = 90; // 90 days of history!
  const today = new Date();

  let currentWeight = 82.5; // Starts at 82.5kg, gradually cuts down to ~76.5kg
  const personalRecordsMap = new Map<string, { weight: number; reps: number; date: Date }>();

  for (let i = totalDays; i >= 0; i--) {
    const sessionDate = subDays(today, i);
    // Add random hour between 8:00 and 20:00
    sessionDate.setHours(9 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));

    const dayOfWeek = sessionDate.getDay(); // 0: Sun, 1: Mon, ..., 6: Sat

    // 1. Log Body Weight (Daily with small realistic fluctuation)
    currentWeight -= 0.06 + (Math.random() * 0.2 - 0.1); // gradual cut trend with daily noise
    const roundedWeight = Math.round(currentWeight * 10) / 10;
    const weightDate = new Date(sessionDate);
    weightDate.setHours(7, 30, 0, 0);

    try {
      await prisma.bodyWeight.create({
        data: {
          date: weightDate,
          weight: roundedWeight,
        },
      });
    } catch {
      // ignore unique constraint if any duplicate day
    }

    // 2. Workout Sessions (4-5 days a week)
    // Mon: Chest & Arms, Tue: Back & Core, Thu: Legs & Shoulders, Fri: Full Body / Push, Sat: Cardio+Core
    const isWorkoutDay = [1, 2, 4, 5, 6].includes(dayOfWeek);
    if (isWorkoutDay) {
      let targetMuscles: MuscleGroup[] = [];
      if (dayOfWeek === 1) targetMuscles = [MuscleGroup.CHEST, MuscleGroup.ARMS];
      else if (dayOfWeek === 2) targetMuscles = [MuscleGroup.BACK, MuscleGroup.CORE];
      else if (dayOfWeek === 4) targetMuscles = [MuscleGroup.LEGS, MuscleGroup.SHOULDERS];
      else if (dayOfWeek === 5) targetMuscles = [MuscleGroup.CHEST, MuscleGroup.BACK];
      else if (dayOfWeek === 6) targetMuscles = [MuscleGroup.LEGS, MuscleGroup.CORE];

      const duration = 45 + Math.floor(Math.random() * 35); // 45-80 mins
      const session = await prisma.workoutSession.create({
        data: {
          date: sessionDate,
          duration,
          notes: i % 7 === 0 ? "Felt strong today, hit progressive targets! 🔥" : null,
        },
      });

      // Pick 3-5 exercises for this session
      const selectedExercises: string[] = [];
      for (const m of targetMuscles) {
        const available = exerciseMapByMuscle[m] || [];
        if (available.length > 0) {
          // pick 2 random from this muscle
          const shuffled = [...available].sort(() => 0.5 - Math.random());
          selectedExercises.push(...shuffled.slice(0, 2));
        }
      }

      // Progression multiplier (increases as i gets closer to 0)
      const progressionFactor = 1 + ((totalDays - i) / totalDays) * 0.35; // 35% strength gain over 90 days

      for (const exId of selectedExercises) {
        const numSets = 3 + Math.floor(Math.random() * 2); // 3-4 sets
        const baseWeight = 30 + Math.floor(Math.random() * 50); // baseline weight
        const progressWeight = Math.round(baseWeight * progressionFactor * 2) / 2; // round to 0.5kg

        for (let s = 1; s <= numSets; s++) {
          const reps = 8 + Math.floor(Math.random() * 5); // 8-12 reps
          const setWeight = progressWeight + (s - 1) * 2.5; // pyramid sets

          await prisma.workoutSet.create({
            data: {
              sessionId: session.id,
              exerciseId: exId,
              setNumber: s,
              reps,
              weight: setWeight,
              notes: s === numSets ? "RPE 9" : null,
            },
          });

          // Check Personal Record
          const existingPR = personalRecordsMap.get(exId);
          if (!existingPR || setWeight > existingPR.weight) {
            personalRecordsMap.set(exId, {
              weight: setWeight,
              reps,
              date: sessionDate,
            });
          }
        }
      }
    }

    // 3. Cardio Sessions (3-4 times a week)
    const isCardioDay = [0, 2, 4, 6].includes(dayOfWeek);
    if (isCardioDay) {
      const cardioTypes = [CardioType.TREADMILL, CardioType.CYCLING, CardioType.SWIMMING, CardioType.JUMP_ROPE];
      const selectedType = cardioTypes[Math.floor(Math.random() * cardioTypes.length)];
      const cardioDuration = 20 + Math.floor(Math.random() * 35); // 20-55 mins
      let distance = 0;
      let calories = 0;

      if (selectedType === CardioType.TREADMILL) {
        distance = Math.round((cardioDuration * 0.14 + Math.random() * 1.5) * 10) / 10; // 3-7 km
        calories = Math.round(distance * 68 + Math.random() * 50);
      } else if (selectedType === CardioType.CYCLING) {
        distance = Math.round((cardioDuration * 0.35 + Math.random() * 3) * 10) / 10; // 8-20 km
        calories = Math.round(distance * 32 + Math.random() * 60);
      } else if (selectedType === CardioType.SWIMMING) {
        distance = Math.round((cardioDuration * 0.035) * 10) / 10; // 1-2 km
        calories = Math.round(cardioDuration * 9);
      } else {
        distance = Math.round((cardioDuration * 0.08) * 10) / 10;
        calories = Math.round(cardioDuration * 11);
      }

      await prisma.cardioSession.create({
        data: {
          type: selectedType,
          date: sessionDate,
          duration: cardioDuration,
          distance,
          caloriesBurned: calories,
          notes: selectedType === CardioType.TREADMILL ? "Incline walking / jog interval" : null,
        },
      });
    }

    // 4. Nutrition Log (Daily with 3-5 meals per day)
    const mealTemplates = [
      { type: MealType.BREAKFAST, name: "Oatmeal with Whey Protein & Berries", cal: 480, p: 40, c: 55, f: 10 },
      { type: MealType.BREAKFAST, name: "Egg White Omelet with Sourdough Toast", cal: 420, p: 35, c: 45, f: 12 },
      { type: MealType.LUNCH, name: "Grilled Chicken Breast with Jasmine Rice & Broccoli", cal: 650, p: 55, c: 75, f: 14 },
      { type: MealType.LUNCH, name: "Salmon Bowl with Quinoa and Avocado", cal: 720, p: 48, c: 60, f: 28 },
      { type: MealType.DINNER, name: "Lean Sirloin Steak with Sweet Potato & Asparagus", cal: 680, p: 52, c: 50, f: 22 },
      { type: MealType.DINNER, name: "Tuna Poke Bowl with Brown Rice & Edamame", cal: 610, p: 45, c: 65, f: 16 },
      { type: MealType.SNACK, name: "Greek Yogurt with Honey & Almonds", cal: 260, p: 22, c: 24, f: 9 },
      { type: MealType.SNACK, name: "Whey Isolate Shake with Banana", cal: 280, p: 32, c: 30, f: 3 },
      { type: MealType.SUPPER, name: "Casein Protein Pudding", cal: 180, p: 28, c: 6, f: 2 },
    ];

    // Pick 3 to 4 meals
    const mealsToLog = [
      mealTemplates[Math.floor(Math.random() * 2)], // Breakfast
      mealTemplates[2 + Math.floor(Math.random() * 2)], // Lunch
      mealTemplates[4 + Math.floor(Math.random() * 2)], // Dinner
      mealTemplates[6 + Math.floor(Math.random() * 3)], // Snack / Supper
    ];

    for (const m of mealsToLog) {
      const variation = 0.9 + Math.random() * 0.2; // +/- 10%
      await prisma.nutritionEntry.create({
        data: {
          date: sessionDate,
          mealType: m.type,
          foodName: m.name,
          calories: Math.round(m.cal * variation),
          protein: Math.round(m.p * variation * 10) / 10,
          carbs: Math.round(m.c * variation * 10) / 10,
          fat: Math.round(m.f * variation * 10) / 10,
        },
      });
    }
  }

  // Save all discovered Personal Records
  console.log(`Updating ${personalRecordsMap.size} Personal Records...`);
  for (const [exerciseId, pr] of personalRecordsMap.entries()) {
    await prisma.personalRecord.create({
      data: {
        exerciseId,
        weight: pr.weight,
        reps: pr.reps,
        date: pr.date,
      },
    });
  }

  // Update Streaks
  await prisma.streak.upsert({
    where: { type: "WORKOUT" },
    update: {
      currentStreak: 18,
      longestStreak: 24,
      lastActiveDate: today,
    },
    create: {
      type: "WORKOUT",
      currentStreak: 18,
      longestStreak: 24,
      lastActiveDate: today,
    },
  });

  await prisma.streak.upsert({
    where: { type: "NUTRITION" },
    update: {
      currentStreak: 45,
      longestStreak: 45,
      lastActiveDate: today,
    },
    create: {
      type: "NUTRITION",
      currentStreak: 45,
      longestStreak: 45,
      lastActiveDate: today,
    },
  });

  console.log("✨ Successfully populated 20x Mock Data spanning across 90 days!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
