// src/config/date.ts
// version: 1.0.0
// Centralized configuration for date and calendar settings.

import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

/**
 * Default calendar settings for the application.
 * This allows easy swapping of calendars and locales in the future.
 */
export const DATE_CONFIG = {
  calendar: persian,
  locale: persian_fa,
};
