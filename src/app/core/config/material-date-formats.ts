/**
 * Material Date Formats Configuration
 * Custom date formats for Angular Material Date Picker with Native Date Adapter
 *
 * Note: MatNativeDateModule uses browser's Intl API for formatting.
 * The format strings here guide the display but actual formatting depends on locale.
 */

import { MatDateFormats } from '@angular/material/core';

/**
 * Custom date format for Material Month/Year Picker
 * Displays dates in MM/YYYY format (e.g., "11/2025")
 *
 * For native date adapter, we use a custom implementation
 * that formats the date manually in the component.
 */
export const MONTH_YEAR_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};

/**
 * Standard date format for Material Date Picker
 * Displays dates in DD/MM/YYYY format (e.g., "27/11/2025")
 */
export const STANDARD_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};
