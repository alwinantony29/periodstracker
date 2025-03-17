/**
 * Cycle Calculation Utilities
 *
 * These functions implement menstrual cycle science to provide accurate predictions.
 * Key assumptions:
 * - Average cycle is 28 days (can be personalized based on user data)
 * - Luteal phase is approximately 14 days
 * - Ovulation occurs around day 14 (cycle day - 14)
 * - Fertile window is approximately 5 days before ovulation plus 1 day after
 */

/**
 * Calculate the next expected period date based on last period and cycle length
 */
export const calculateNextPeriod = (
  lastPeriodDate: Date,
  cycleLength: number = 28
): Date => {
  const nextPeriod = new Date(lastPeriodDate);
  nextPeriod.setDate(nextPeriod.getDate() + cycleLength);
  return nextPeriod;
};

/**
 * Calculate the fertile window (most likely days for conception)
 * Typically 5 days before ovulation plus day of ovulation and day after
 */
export const calculateFertileWindow = (
  lastPeriodDate: Date,
  cycleLength: number = 28
): { start: Date; end: Date } | null => {
  // Ovulation typically occurs 14 days before the next period
  const ovulationDay = cycleLength - 14;

  if (ovulationDay <= 0) {
    // Invalid cycle length
    return null;
  }

  const ovulationDate = new Date(lastPeriodDate);
  ovulationDate.setDate(ovulationDate.getDate() + ovulationDay);

  const fertileStart = new Date(ovulationDate);
  fertileStart.setDate(fertileStart.getDate() - 5);

  const fertileEnd = new Date(ovulationDate);
  fertileEnd.setDate(fertileEnd.getDate() + 1);

  return {
    start: fertileStart,
    end: fertileEnd,
  };
};

/**
 * Calculate the current phase of the menstrual cycle
 */
export const calculateCyclePhase = (
  cycleDay: number,
  cycleLength: number = 28
): string => {
  // Period phase (typically days 1-5)
  if (cycleDay <= 5) {
    return "Period";
  }

  // Follicular phase (after period, before ovulation)
  const ovulationDay = cycleLength - 14;
  if (cycleDay < ovulationDay - 1) {
    return "Follicular";
  }

  // Ovulation phase (typically 1-2 days)
  if (cycleDay >= ovulationDay - 1 && cycleDay <= ovulationDay + 1) {
    return "Ovulation";
  }

  // Luteal phase (after ovulation, before next period)
  return "Luteal";
};

/**
 * Check if a cycle length is within normal range
 * Normal cycles typically range from 21-35 days
 */
export const isCycleLengthNormal = (cycleLength: number): boolean => {
  return cycleLength >= 21 && cycleLength <= 35;
};

/**
 * Check if a period length is within normal range
 * Normal periods typically last 3-7 days
 */
export const isPeriodLengthNormal = (periodLength: number): boolean => {
  return periodLength >= 2 && periodLength <= 8;
};

/**
 * Detect potential irregular cycles based on variation between cycles
 * Variation of more than 7-9 days may indicate irregularity
 */
export const isIrregularCycle = (cycleLengths: number[]): boolean => {
  if (cycleLengths.length < 2) return false;

  const avgCycleLength =
    cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length;

  return cycleLengths.some((length) => Math.abs(length - avgCycleLength) > 7);
};
