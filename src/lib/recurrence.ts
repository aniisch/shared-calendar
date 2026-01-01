import { RRule, rrulestr, Options } from "rrule";

export type RecurrenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export interface RecurrenceOptions {
  frequency: RecurrenceFrequency;
  interval: number; // Every X days/weeks/months/years
  until?: Date; // End date
  count?: number; // Or number of occurrences
  byWeekday?: number[]; // For weekly: 0=Monday, 6=Sunday
  byMonthDay?: number; // For monthly: day of month
}

const frequencyMap: Record<RecurrenceFrequency, number> = {
  DAILY: RRule.DAILY,
  WEEKLY: RRule.WEEKLY,
  MONTHLY: RRule.MONTHLY,
  YEARLY: RRule.YEARLY,
};

/**
 * Create an RRule string from options
 */
export function createRecurrenceRule(
  startDate: Date,
  options: RecurrenceOptions
): string {
  const ruleOptions: Partial<Options> = {
    freq: frequencyMap[options.frequency],
    interval: options.interval,
    dtstart: startDate,
  };

  if (options.until) {
    ruleOptions.until = options.until;
  } else if (options.count) {
    ruleOptions.count = options.count;
  }

  if (options.byWeekday && options.byWeekday.length > 0) {
    ruleOptions.byweekday = options.byWeekday;
  }

  if (options.byMonthDay) {
    ruleOptions.bymonthday = options.byMonthDay;
  }

  const rule = new RRule(ruleOptions);
  return rule.toString();
}

/**
 * Get all occurrences of a recurring event between two dates
 */
export function getRecurrenceOccurrences(
  ruleString: string,
  startDate: Date,
  rangeStart: Date,
  rangeEnd: Date,
  maxOccurrences: number = 100
): Date[] {
  try {
    const rule = rrulestr(ruleString, { dtstart: startDate });
    return rule.between(rangeStart, rangeEnd, true).slice(0, maxOccurrences);
  } catch (error) {
    console.error("Error parsing recurrence rule:", error);
    return [];
  }
}

/**
 * Parse an RRule string to get human-readable description
 */
export function describeRecurrence(ruleString: string): string {
  try {
    const rule = rrulestr(ruleString);
    return rule.toText();
  } catch {
    return "Récurrence personnalisée";
  }
}

/**
 * Common recurrence presets
 */
export const RECURRENCE_PRESETS = [
  { value: "none", label: "Ne pas répéter" },
  { value: "daily", label: "Tous les jours" },
  { value: "weekly", label: "Toutes les semaines" },
  { value: "biweekly", label: "Toutes les 2 semaines" },
  { value: "monthly", label: "Tous les mois" },
  { value: "yearly", label: "Tous les ans" },
  { value: "weekdays", label: "Jours ouvrés (Lun-Ven)" },
  { value: "custom", label: "Personnalisé..." },
] as const;

export type RecurrencePreset = (typeof RECURRENCE_PRESETS)[number]["value"];

/**
 * Create RRule string from preset
 */
export function createRuleFromPreset(
  preset: RecurrencePreset,
  startDate: Date,
  until?: Date
): string | null {
  switch (preset) {
    case "none":
      return null;
    case "daily":
      return createRecurrenceRule(startDate, {
        frequency: "DAILY",
        interval: 1,
        until,
      });
    case "weekly":
      return createRecurrenceRule(startDate, {
        frequency: "WEEKLY",
        interval: 1,
        until,
      });
    case "biweekly":
      return createRecurrenceRule(startDate, {
        frequency: "WEEKLY",
        interval: 2,
        until,
      });
    case "monthly":
      return createRecurrenceRule(startDate, {
        frequency: "MONTHLY",
        interval: 1,
        until,
      });
    case "yearly":
      return createRecurrenceRule(startDate, {
        frequency: "YEARLY",
        interval: 1,
        until,
      });
    case "weekdays":
      return createRecurrenceRule(startDate, {
        frequency: "WEEKLY",
        interval: 1,
        byWeekday: [0, 1, 2, 3, 4], // Mon-Fri
        until,
      });
    default:
      return null;
  }
}
