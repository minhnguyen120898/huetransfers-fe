import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardAppearance, MatCardModule } from '@angular/material/card';
import { TableHeaderActions, TableHeaderLayout, TableHeaderTitle } from '../table-header';

@Component({
  selector: 'app-table-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, TableHeaderLayout, TableHeaderTitle, TableHeaderActions],
  template: `
    <mat-card [appearance]="appearance()" class="w-full overflow-hidden">
      <div class="px-4">
        <ng-content select="[header]"></ng-content>
      </div>
      <app-table-header-layout>
        @if (title()) {
          <app-table-header-title class="flex-shrink-0">{{ title() }}</app-table-header-title>
        }
        <app-table-header-actions class="w-full">
          <ng-content select="[actions]"></ng-content>
        </app-table-header-actions>
      </app-table-header-layout>

      <ng-content select="[table]"></ng-content>
    </mat-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableCard {
  public readonly title = input<string>('');
  public readonly appearance = input<MatCardAppearance>('outlined');
}
