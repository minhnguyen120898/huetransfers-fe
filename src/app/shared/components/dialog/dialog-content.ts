import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-content',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <mat-dialog-content>
      <ng-content></ng-content>
    </mat-dialog-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogContent {}
