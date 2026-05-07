import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MonthPickerComponent } from '@shared/components';

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    MatIconModule,
    MonthPickerComponent,
    MatButtonModule,
    OverlayModule,
  ],
  templateUrl: './sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  public isMobile = input<boolean>(true);
  public isDateRangeOpen = signal(false);

  public toggleDateRange() {
    this.isDateRangeOpen.set(!this.isDateRangeOpen());
  }

  public closeDateRange() {
    this.isDateRangeOpen.set(false);
  }
}
