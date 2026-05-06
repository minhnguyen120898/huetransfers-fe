import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <div class="w-full h-full">
      <ng-content select="app-dialog-header"></ng-content>
      <ng-content select="app-dialog-content"></ng-content>
      <ng-content select="app-dialog-actions"></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dialog {}
