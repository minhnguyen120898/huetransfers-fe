import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

@Component({
  selector: 'app-date-range-picker',
  imports: [MatFormFieldModule, MatDatepickerModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './date-range-picker.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangePicker {
  label = input<string>('Date Range');
  startPlaceholder = input<string>('Start date');
  endPlaceholder = input<string>('End date');

  dateRangeChange = output<DateRange>();

  readonly range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  onDateChange(): void {
    const start = this.range.value.start;
    const end = this.range.value.end;

    if (start && end) {
      this.dateRangeChange.emit({ start, end });
    }
  }

  clear(): void {
    this.range.reset();
    this.dateRangeChange.emit({ start: null, end: null });
  }
}
