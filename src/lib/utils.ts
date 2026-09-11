import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const currencyFormatter = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number) {
  return currencyFormatter.format(amount);
}

const moneyFormatter = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Like formatPrice, but keeps cents — used for invoices/sales where tax math produces them. */
export function formatMoney(amount: number) {
  return moneyFormatter.format(amount);
}

const dateFormatter = new Intl.DateTimeFormat("es-DO", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const BARE_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * `new Date("2026-09-11")` is parsed as UTC midnight per the ECMAScript spec
 * (unlike a datetime string, which is parsed as local time) — formatting
 * that in a timezone behind UTC silently renders the previous day. Every
 * calendar date in this app (appointment dates, time-off dates, the booking
 * wizard's in-progress selection) is meant as a local-timezone concept, so
 * bare "YYYY-MM-DD" strings are parsed from their Y/M/D components directly.
 */
export function toLocalDate(date: Date | string): Date {
  if (typeof date === "string") {
    const match = BARE_DATE_RE.exec(date);
    if (match) {
      const [, y, m, d] = match;
      return new Date(Number(y), Number(m) - 1, Number(d));
    }
    return new Date(date);
  }
  return date;
}

export function formatDate(date: Date | string) {
  return dateFormatter.format(toLocalDate(date));
}

const shortDateFormatter = new Intl.DateTimeFormat("es-DO", {
  day: "2-digit",
  month: "short",
});

export function formatShortDate(date: Date | string) {
  return shortDateFormatter.format(toLocalDate(date));
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

export function to12h(time: string) {
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${mStr} ${period}`;
}

export function generateBookingNumber() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  const timePart = Date.now().toString(36).toUpperCase().slice(-4);
  return `LSR-${timePart}${rand}`;
}

/** Temporary password issued for auto-created/reset staff and customer accounts — shown once, meant to be changed. */
export function generateTempPassword() {
  return `Lsr-${Math.random().toString(36).slice(2, 10)}${Math.floor(Math.random() * 100)}`;
}

export function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
