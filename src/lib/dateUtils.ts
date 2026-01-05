// Utility functions for Persian (Jalali) date conversion
// Using a simple implementation without external dependencies

/**
 * Converts a Gregorian date to Jalali (Persian) date
 */
export function gregorianToJalali(
  gy: number,
  gm: number,
  gd: number,
): {
  jy: number;
  jm: number;
  jd: number;
} {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = 979;
  let gy2 = gy - 1600;
  let days =
    365 * gy2 +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const jm =
    days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { jy, jm, jd };
}

/**
 * Converts a Jalali (Persian) date to Gregorian date
 */
export function jalaliToGregorian(
  jy: number,
  jm: number,
  jd: number,
): {
  gy: number;
  gm: number;
  gd: number;
} {
  jy += 1595;
  let days =
    -355668 +
    365 * jy +
    Math.floor(jy / 33) * 8 +
    Math.floor(((jy % 33) + 3) / 4) +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  let gy = 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const sal_a = [
    0,
    31,
    (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  let gm = 0;
  while (gm < 13 && gd > sal_a[gm]) {
    gd -= sal_a[gm];
    gm++;
  }
  return { gy, gm, gd };
}

/**
 * Converts ISO date string to Jalali date string (YYYY-MM-DDTHH:mm format)
 * Always interprets and displays in Tehran timezone
 */
export function isoToJalali(isoString: string | null | undefined): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";

    // Convert to Tehran timezone explicitly
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Tehran",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });

    const parts = formatter.formatToParts(date);
    const partsMap: Record<string, string> = {};
    for (const part of parts) {
      if (part.type !== "literal") {
        partsMap[part.type] = part.value;
      }
    }

    const gy = Number(partsMap.year);
    const gm = Number(partsMap.month);
    const gd = Number(partsMap.day);
    const { jy, jm, jd } = gregorianToJalali(gy, gm, gd);
    const hours = partsMap.hour.padStart(2, "0");
    const minutes = partsMap.minute.padStart(2, "0");

    return `${jy}-${String(jm).padStart(2, "0")}-${String(jd).padStart(
      2,
      "0",
    )}T${hours}:${minutes}`;
  } catch {
    return "";
  }
}

/**
 * Gets current Jalali date in YYYY-MM-DDTHH:mm format
 */
export function getCurrentJalaliDateTime(): string {
  const now = new Date();
  const gy = now.getFullYear();
  const gm = now.getMonth() + 1;
  const gd = now.getDate();
  const { jy, jm, jd } = gregorianToJalali(gy, gm, gd);
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${jy}-${String(jm).padStart(2, "0")}-${String(jd).padStart(
    2,
    "0",
  )}T${hours}:${minutes}`;
}

/**
 * Converts Jalali date string (YYYY-MM-DDTHH:mm format) to ISO date string
 * Input is interpreted as Tehran local time
 */
export function jalaliToIso(
  jalaliString: string | null | undefined,
): string | null {
  if (!jalaliString) return null;

  try {
    const [datePart, timePart] = jalaliString.split("T");
    if (!datePart) return null;

    const [jy, jm, jd] = datePart.split("-").map(Number);
    if (!jy || !jm || !jd) return null;

    const { gy, gm, gd } = jalaliToGregorian(jy, jm, jd);
    const [hours = "00", minutes = "00"] = timePart ? timePart.split(":") : [];

    // We need to convert "Tehran local time" to UTC
    // Strategy: Create a date object, then use Intl to find what UTC time corresponds to this Tehran time
    // We'll use an iterative approach to find the correct UTC time

    // Start with an approximation: assume UTC+3:30 (210 minutes)
    const h = Number(hours);
    const m = Number(minutes);
    const approxUtc = new Date(
      Date.UTC(gy, gm - 1, gd, h, m, 0) - 210 * 60 * 1000,
    );

    // Now check what Tehran time this UTC time represents
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Tehran",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });

    // Iterate to find the correct UTC time
    let utcDate = approxUtc;
    for (let i = 0; i < 3; i++) {
      const parts = formatter.formatToParts(utcDate);
      const partsMap: Record<string, string> = {};
      for (const part of parts) {
        if (part.type !== "literal") {
          partsMap[part.type] = part.value;
        }
      }

      const tehranHour = Number(partsMap.hour);
      const tehranMinute = Number(partsMap.minute);

      // Calculate the difference
      const diffMinutes = (tehranHour - h) * 60 + (tehranMinute - m);

      // Adjust UTC time
      utcDate = new Date(utcDate.getTime() - diffMinutes * 60 * 1000);

      // If we're close enough, break
      if (Math.abs(diffMinutes) < 1) break;
    }

    return utcDate.toISOString();
  } catch (error) {
    console.error("Error in jalaliToIso:", error);
    return null;
  }
}

/**
 * Formats Jalali date for display (e.g., "1403/09/15 14:30")
 * Always displays in Tehran timezone
 */
export function formatJalaliForDisplay(
  isoString: string | null | undefined,
): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";

    // Convert to Tehran timezone explicitly
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Tehran",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });

    const parts = formatter.formatToParts(date);
    const partsMap: Record<string, string> = {};
    for (const part of parts) {
      if (part.type !== "literal") {
        partsMap[part.type] = part.value;
      }
    }

    const gy = Number(partsMap.year);
    const gm = Number(partsMap.month);
    const gd = Number(partsMap.day);
    const { jy, jm, jd } = gregorianToJalali(gy, gm, gd);
    const hours = partsMap.hour.padStart(2, "0");
    const minutes = partsMap.minute.padStart(2, "0");

    return `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(
      2,
      "0",
    )} ${hours}:${minutes}`;
  } catch {
    return "";
  }
}

/**
 * Ensures a date string is in ISO format (YYYY-MM-DDTHH:mm:ss).
 * - If it's already an ISO UTC string (with Z or timezone), returns it as ISO string
 * - If it's a Jalali date string (YYYY-MM-DDTHH:mm with year > 1500), converts it to ISO UTC
 * - If it's a naive Gregorian string (without timezone), treats it as Tehran time and converts to ISO UTC
 * Returns null if the date is invalid or null.
 * Returns date in ISO format: YYYY-MM-DDTHH:mm:ss.fffZ (UTC)
 */
export function ensureIsoDate(
  dateString: string | null | undefined,
): string | null {
  if (!dateString) return null;

  try {
    // Check if it's already an ISO UTC string (has Z or timezone offset)
    const hasTimezone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(dateString.trim());
    if (hasTimezone) {
      // It's already an ISO string with timezone, return as-is
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }

    // Check if it's a Jalali date (year > 1500)
    const [datePart] = dateString.split("T");
    if (datePart) {
      const [yearStr] = datePart.split("-");
      if (yearStr) {
        const year = Number(yearStr);
        // If year is > 1500, it's likely a Jalali date
        if (year > 1500) {
          // Convert Jalali to ISO UTC
          const converted = jalaliToIso(dateString);
          if (converted) {
            return converted;
          }
        }
      }
    }

    // Try parsing as naive Gregorian (without timezone)
    // If it's a valid Gregorian date without timezone, treat it as Tehran time
    const isoDate = new Date(dateString);
    if (!isNaN(isoDate.getTime())) {
      const year = isoDate.getFullYear();
      if (year >= 1900 && year <= 2100) {
        // It's a valid Gregorian date, but we need to check if it was naive
        // If the original string didn't have timezone, treat it as Tehran time
        if (!hasTimezone) {
          // Parse as Tehran local time and convert to UTC
          const [dPart, tPart] = dateString.split("T");
          if (dPart) {
            const [y, m, d] = dPart.split("-").map(Number);
            const [h = 0, min = 0] = tPart
              ? tPart.split(":").map(Number)
              : [0, 0];

            // Use the iterative approach to convert Tehran time to UTC
            const approxUtc = new Date(
              Date.UTC(y, m - 1, d, h, min, 0) - 210 * 60 * 1000,
            );

            const formatter = new Intl.DateTimeFormat("en-CA", {
              timeZone: "Asia/Tehran",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hourCycle: "h23",
            });

            let utcDate = approxUtc;
            for (let i = 0; i < 3; i++) {
              const parts = formatter.formatToParts(utcDate);
              const partsMap: Record<string, string> = {};
              for (const part of parts) {
                if (part.type !== "literal") {
                  partsMap[part.type] = part.value;
                }
              }

              const tehranHour = Number(partsMap.hour);
              const tehranMinute = Number(partsMap.minute);

              const diffMinutes = (tehranHour - h) * 60 + (tehranMinute - min);
              utcDate = new Date(utcDate.getTime() - diffMinutes * 60 * 1000);
              if (Math.abs(diffMinutes) < 1) break;
            }

            return utcDate.toISOString();
          }
        }
        // If it had timezone, return as ISO
        return isoDate.toISOString();
      }
    }

    // Fallback: try jalaliToIso
    const converted = jalaliToIso(dateString);
    if (converted) {
      return converted;
    }

    return null;
  } catch {
    return null;
  }
}
