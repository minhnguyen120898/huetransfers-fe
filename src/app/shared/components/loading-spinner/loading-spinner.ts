import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  imports: [MatProgressSpinnerModule],
  templateUrl: './loading-spinner.html',
  styles: `
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSpinner {
  message = input<string>('Loading...');
  diameter = input<number>(50);
}
