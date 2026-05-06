import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-actions',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <mat-dialog-actions class="h-18" [align]="align()">
      <ng-content></ng-content>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogActions {
  public readonly align = input<'start' | 'center' | 'end'>('end');
}
