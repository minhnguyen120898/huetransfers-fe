import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-error-state',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './error-state.html',
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
export class ErrorState {
  title = input<string>('Something went wrong');
  message = input<string>('An error occurred while loading the data.');
  retryText = input<string>('Try Again');
  showRetry = input<boolean>(true);

  retry = output<void>();

  onRetry(): void {
    this.retry.emit();
  }
}
