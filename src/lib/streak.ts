import { prisma } from "./prisma";
import { StreakType } from "@prisma/client";
import { startOfDay, differenceInCalendarDays } from "date-fns";

/**
 * Update streak for a given type.
 * Call this after creating a new workout/cardio session or nutrition entry.
 */
export async function updateStreak(type: StreakType): Promise<{
  currentStreak: number;
  longestStreak: number;
}> {
  const today = startOfDay(new Date());

  const streak = await prisma.streak.upsert({
    where: { type },
    update: {},
    create: { type, currentStreak: 0, longestStreak: 0 },
  });

  const lastActive = streak.lastActiveDate
    ? startOfDay(new Date(streak.lastActiveDate))
    : null;

  let newCurrent = streak.currentStreak;

  if (!lastActive) {
    // First ever entry
    newCurrent = 1;
  } else {
    const daysDiff = differenceInCalendarDays(today, lastActive);

    if (daysDiff === 0) {
      // Same day — streak stays the same
      return { currentStreak: streak.currentStreak, longestStreak: streak.longestStreak };
    } else if (daysDiff === 1) {
      // Consecutive day — increment
      newCurrent = streak.currentStreak + 1;
    } else {
      // Gap > 1 day — streak resets
      newCurrent = 1;
    }
  }

  const newLongest = Math.max(streak.longestStreak, newCurrent);

  const updated = await prisma.streak.update({
    where: { type },
    data: {
      currentStreak: newCurrent,
      longestStreak: newLongest,
      lastActiveDate: today,
    },
  });

  return { currentStreak: updated.currentStreak, longestStreak: updated.longestStreak };
}

/**
 * Get current streaks for both types.
 */
export async function getStreaks() {
  const streaks = await prisma.streak.findMany();
  const workout = streaks.find((s) => s.type === "WORKOUT");
  const nutrition = streaks.find((s) => s.type === "NUTRITION");

  return {
    workout: {
      current: workout?.currentStreak ?? 0,
      longest: workout?.longestStreak ?? 0,
      lastActive: workout?.lastActiveDate,
    },
    nutrition: {
      current: nutrition?.currentStreak ?? 0,
      longest: nutrition?.longestStreak ?? 0,
      lastActive: nutrition?.lastActiveDate,
    },
  };
}

/**
 * Check if a streak is about to break (no entry yesterday).
 */
export async function isStreakAtRisk(type: StreakType): Promise<boolean> {
  const streak = await prisma.streak.findUnique({ where: { type } });
  if (!streak || !streak.lastActiveDate || streak.currentStreak === 0) {
    return false;
  }

  const today = startOfDay(new Date());
  const lastActive = startOfDay(new Date(streak.lastActiveDate));
  const daysDiff = differenceInCalendarDays(today, lastActive);

  // At risk if last active was yesterday and nothing logged today
  return daysDiff >= 1;
}
