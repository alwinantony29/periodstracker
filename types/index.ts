/**
 * Period log entry representing a single menstrual cycle
 */
export type PeriodLog = {
  startDate: string; // ISO string date when period started
  endDate: string | null; // ISO string date when period ended (null if ongoing)
  flow: string; // Flow intensity: 'light', 'medium', 'heavy'
  symptoms: string[]; // Array of symptom IDs
};

/**
 * User's cycle data including history and calculated averages
 */
export type CycleData = {
  periodLogs: PeriodLog[];
  averageCycleLength: number; // Average days between period starts
  averagePeriodLength: number; // Average duration of period
};

/**
 * Reminder settings for notifications
 */
export type ReminderSettings = {
  periodReminder: boolean;
  periodReminderDays: number;
  ovulationReminder: boolean;
  medicationReminder: boolean;
  medicationTimes: string[];
};

/**
 * User preferences for app settings
 */
export type UserPreferences = {
  theme: "light" | "dark" | "system";
  useLocalStorageOnly: boolean;
  showFertileWindow: boolean;
  showPredictions: boolean;
};
