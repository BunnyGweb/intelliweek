import { differenceInDays } from "date-fns";

export function calculateStudyDuration(
  currentDate: Date,
  startDuration: number,
  targetDuration: number,
  startDate: Date,
  testDate: Date
): number {
  if (currentDate < startDate) return 0;
  if (currentDate >= testDate) return targetDuration;

  const totalDays = differenceInDays(testDate, startDate);
  const daysPassed = differenceInDays(currentDate, startDate);

  if (totalDays <= 0) return targetDuration;

  // Linear interpolation
  const progress = daysPassed / totalDays;
  const duration = startDuration + (targetDuration - startDuration) * progress;

  return Math.round(duration); // Round to nearest minute
}
