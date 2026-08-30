import { prisma } from "./prisma";

interface PRCheckResult {
  isNewPR: boolean;
  exerciseId: string;
  exerciseName: string;
  newWeight: number;
  newReps: number;
  previousWeight: number | null;
  previousReps: number | null;
}

/**
 * Check if a workout set is a new Personal Record.
 * A PR is defined as the heaviest weight ever lifted for a given exercise.
 */
export async function checkForPR(
  exerciseId: string,
  weight: number,
  reps: number
): Promise<PRCheckResult> {
  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
  });

  const existingPR = await prisma.personalRecord.findUnique({
    where: { exerciseId },
  });

  const isNewPR = !existingPR || weight > existingPR.weight;

  if (isNewPR) {
    await prisma.personalRecord.upsert({
      where: { exerciseId },
      update: {
        weight,
        reps,
        date: new Date(),
      },
      create: {
        exerciseId,
        weight,
        reps,
        date: new Date(),
      },
    });
  }

  return {
    isNewPR,
    exerciseId,
    exerciseName: exercise?.name ?? "Unknown",
    newWeight: weight,
    newReps: reps,
    previousWeight: existingPR?.weight ?? null,
    previousReps: existingPR?.reps ?? null,
  };
}

/**
 * Check all sets in a workout session for PRs.
 */
export async function checkSessionForPRs(
  sets: Array<{ exerciseId: string; weight: number; reps: number }>
): Promise<PRCheckResult[]> {
  // Group sets by exercise, find max weight per exercise
  const maxByExercise = new Map<string, { weight: number; reps: number }>();

  for (const set of sets) {
    const current = maxByExercise.get(set.exerciseId);
    if (!current || set.weight > current.weight) {
      maxByExercise.set(set.exerciseId, { weight: set.weight, reps: set.reps });
    }
  }

  const results: PRCheckResult[] = [];
  for (const [exerciseId, { weight, reps }] of maxByExercise) {
    const result = await checkForPR(exerciseId, weight, reps);
    if (result.isNewPR) {
      results.push(result);
    }
  }

  return results;
}

/**
 * Get all personal records.
 */
export async function getAllPRs() {
  const prs = await prisma.personalRecord.findMany();

  // Fetch exercise names
  const exerciseIds = prs.map((pr) => pr.exerciseId);
  const exercises = await prisma.exercise.findMany({
    where: { id: { in: exerciseIds } },
  });

  const exerciseMap = new Map(exercises.map((e) => [e.id, e]));

  return prs.map((pr) => ({
    ...pr,
    exerciseName: exerciseMap.get(pr.exerciseId)?.name ?? "Unknown",
    muscleGroup: exerciseMap.get(pr.exerciseId)?.muscleGroup ?? "UNKNOWN",
  }));
}
