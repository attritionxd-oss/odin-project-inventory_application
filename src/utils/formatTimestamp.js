/**
 * Formats a timestamptz string into a user-friendly UI string
 *
 * @param {string | Date} input - ISO 8601 string or Date object
 * @param {Object} options
 * @param {string} [options.variant='medium'] - 'short' | 'medium' | 'full'
 * @param {string} [options.timeZone] - Force timezone (e.g., 'UTC', 'America/New_York'). Defaults to user system.
 * @param {string} [options.locale] - Specific BCP 47 language tag. Defaults to user system.
 */

export function formatTimestamp(
  input,
  { variant = "medium", timeZone, locale } = {},
) {
  const date = input instanceof Date ? input : new Date(input);

  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  const variantPresets = {
    dateOnly: {
      // e.g., "10/07/2026"
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
    short: {
      dateStyle: "short", // e.g., "10/7/26"
      timeStyle: "short", // e.g., "11:18 AM"
    },
    medium: {
      dateStyle: "medium", // e.g., "Oct 7, 2026"
      timeStyle: "short", // e.g., "11:18 AM"
    },
    full: {
      dateStyle: "full", // e.g., "Wednesday, October 7, 2026"
      timeStyle: "medium", //e.g., "11:18:31 AM"
    },
  };

  const selectedPreset = variantPresets[variant] || variantPresets.medium;

  const formatterOptions = {
    ...selectedPreset,
    ...(timeZone && { timeZone }),
  };

  return new Intl.DateTimeFormat(locale, formatterOptions).format(date);
}
