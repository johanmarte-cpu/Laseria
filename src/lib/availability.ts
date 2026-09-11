import { BUSINESS_HOURS } from "@/lib/constants";

export type ScheduleRow = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart: string | null;
  breakEnd: string | null;
};

export type BookedRange = {
  startTime: string;
  endTime: string;
};

export type TimeSlot = {
  time: string;
  available: boolean;
};

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(total: number): string {
  const h = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const m = (total % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Pure function: given a professional's working schedule for a specific
 * weekday, the appointments already booked that day, and the requested
 * treatment duration, returns every candidate slot with an `available` flag.
 *
 * A slot is unavailable when it would run into the professional's break,
 * spill past closing time, or overlap an existing non-cancelled appointment —
 * this is what guarantees two customers can never double-book the same
 * professional at the same time.
 */
export function computeSlotsForSchedule(
  schedule: ScheduleRow | undefined,
  booked: BookedRange[],
  durationMinutes: number,
  intervalMinutes: number = BUSINESS_HOURS.slotIntervalMinutes,
  /** Minutes-since-midnight below which a slot is in the past (only relevant when the
   * schedule's day is today) — pass `minutesSinceMidnight(new Date()) + BOOKING_LEAD_MINUTES`. */
  minStartMinutes: number | null = null
): TimeSlot[] {
  if (!schedule) return [];

  const openMin = timeToMinutes(schedule.startTime);
  const closeMin = timeToMinutes(schedule.endTime);
  const breakStartMin = schedule.breakStart ? timeToMinutes(schedule.breakStart) : null;
  const breakEndMin = schedule.breakEnd ? timeToMinutes(schedule.breakEnd) : null;

  const bookedRanges = booked.map((b) => ({
    start: timeToMinutes(b.startTime),
    end: timeToMinutes(b.endTime),
  }));

  const slots: TimeSlot[] = [];

  for (let start = openMin; start + durationMinutes <= closeMin; start += intervalMinutes) {
    const end = start + durationMinutes;

    const crossesBreak =
      breakStartMin !== null &&
      breakEndMin !== null &&
      start < breakEndMin &&
      end > breakStartMin;

    const overlapsBooking = bookedRanges.some((r) => start < r.end && end > r.start);
    const isPast = minStartMinutes !== null && start < minStartMinutes;

    slots.push({
      time: minutesToTime(start),
      available: !crossesBreak && !overlapsBooking && !isPast,
    });
  }

  return slots;
}

export const BOOKING_LEAD_MINUTES = 60;

export function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** Merges slot lists from multiple professionals for the "first available" option. */
export function mergeSlotAvailability(slotLists: TimeSlot[][]): TimeSlot[] {
  const byTime = new Map<string, boolean>();
  for (const list of slotLists) {
    for (const slot of list) {
      byTime.set(slot.time, (byTime.get(slot.time) ?? false) || slot.available);
    }
  }
  return Array.from(byTime.entries())
    .sort(([a], [b]) => timeToMinutes(a) - timeToMinutes(b))
    .map(([time, available]) => ({ time, available }));
}
