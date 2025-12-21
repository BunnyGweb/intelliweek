export const START_HOUR = 0; // 12 AM
export const END_HOUR = 24; // 12 AM next day
export const MINUTES_PER_HOUR = 60;
export const TOTAL_MINUTES = (END_HOUR - START_HOUR) * MINUTES_PER_HOUR;
export const PIXELS_PER_MINUTE = 1.5; // Adjustable scale
export const DAY_HEIGHT = TOTAL_MINUTES * PIXELS_PER_MINUTE;

export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

export function formatTime24to12(timeStr: string): string {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export function getPositionFromTime(timeStr: string): number {
  const minutes = timeToMinutes(timeStr);
  const startMinutes = START_HOUR * 60;
  return (minutes - startMinutes) * PIXELS_PER_MINUTE;
}

export function getTimeFromPosition(y: number): string {
  const minutesFromStart = Math.round(y / PIXELS_PER_MINUTE);
  const totalMinutes = START_HOUR * 60 + minutesFromStart;

  // Snap to nearest 15 minutes
  const snappedMinutes = Math.round(totalMinutes / 15) * 15;

  return minutesToTime(snappedMinutes);
}

export function getHeightFromDuration(duration: number): number {
  return duration * PIXELS_PER_MINUTE;
}
