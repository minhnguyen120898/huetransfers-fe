/**
 * Custom Date Adapter for Material Date Picker
 * Formats dates in MM/YYYY format for month/year pickers
 */

import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';
import { format } from 'date-fns';

/**
 * Custom Date Adapter that extends Material's NativeDateAdapter
 * to support MM/YYYY format display for month/year pickers
 */
@Injectable()
export class MonthYearDateAdapter extends NativeDateAdapter {
  /**
   * Override the format method to return MM/YYYY for month/year display
   * The displayFormat parameter comes from MAT_DATE_FORMATS configuration
   */
  override format(date: Date, displayFormat: object): string {
    // Type assertion: displayFormat can be a string from MAT_DATE_FORMATS
    const formatString = displayFormat as unknown as string;

    if (formatString === 'MM/YYYY') {
      return format(date, 'MM/yyyy');
    }

    return super.format(date, displayFormat);
  }

  /**
   * Override parse to handle MM/YYYY input format
   */
  override parse(value: string): Date | null {
    if (!value) {
      return null;
    }

    // Try to parse MM/YYYY format
    const monthYearRegex = /^(\d{1,2})\/(\d{4})$/;
    const match = value.match(monthYearRegex);

    if (match) {
      const month = parseInt(match[1], 10);
      const year = parseInt(match[2], 10);

      if (month >= 1 && month <= 12) {
        return new Date(year, month - 1, 1);
      }
    }

    return super.parse(value);
  }
}
