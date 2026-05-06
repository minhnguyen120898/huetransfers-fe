import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthActions } from '@features/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  private readonly store = inject(Store);
  protected readonly title = signal('booking-management-fe');

  constructor() {
    // Check authentication status on app initialization
    // This restores auth state from localStorage if token is valid
    this.store.dispatch(new AuthActions.CheckAuth());
  }
}
