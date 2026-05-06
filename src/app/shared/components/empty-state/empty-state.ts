import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './empty-state.html',
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
export class EmptyState {
  icon = input<string>('inbox');
  title = input<string>('No data found');
  message = input<string>('There are no items to display.');
  actionText = input<string | undefined>(undefined);
  showAction = input<boolean>(false);

  action = output<void>();

  onAction(): void {
    this.action.emit();
  }
}
