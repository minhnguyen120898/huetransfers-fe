import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-table-header-layout',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <div
      mat-card-header
      class="min-h-[72px] flex flex-col items-start gap-4 md:flex-row md:items-center justify-between p-4"
    >
      <ng-content select="app-table-header-title"></ng-content>
      <ng-content select="app-table-header-actions"></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableHeaderLayout {}
