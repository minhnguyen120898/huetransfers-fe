import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dialog-header',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, MatButtonModule],
  template: `
    <div
      class="h-18 flex items-center justify-between py-4 px-6 w-full border-b border-input-border"
    >
      <ng-content select="app-dialog-header-left"></ng-content>
      <h2
        mat-dialog-title
        class="max-w-[calc(100%-64px)] overflow-hidden text-ellipsis whitespace-nowrap"
      >
        {{ title() }}
      </h2>
      <div class="flex items-center gap-2">
        <ng-content select="app-dialog-header-right"></ng-content>
        @if (hasCloseButton()) {
          <button mat-mini-fab class="flat-style-mini-fab neutral" mat-dialog-close>
            <mat-icon>close</mat-icon>
          </button>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogHeader {
  public readonly title = input<string>('');
  public readonly hasCloseButton = input<boolean>(true);
}
