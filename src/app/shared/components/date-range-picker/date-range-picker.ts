import { Component, OnInit, input, output, ChangeDetectionStrategy } from '@angular/core';
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
export class DateRangePicker implements OnInit {
  label = input<string>('Date Range');
  startPlaceholder = input<string>('Start date');
  endPlaceholder = input<string>('End date');
  defaultValue = input<DateRange | null>(null);

  dateRangeChange = output<DateRange>();

  readonly range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  ngOnInit(): void {
    const def = this.defaultValue();
    if (def?.start && def?.end) {
      this.range.setValue({ start: def.start, end: def.end });
    }
  }

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
