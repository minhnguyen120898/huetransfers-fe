import { ChangeDetectionStrategy, Component, inject, input, computed } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngxs/store';
import { ProfileActionEnum } from './navbar.model';
import { Sidebar } from '../sidebar/sidebar';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { AuthState } from '@features/auth/store/auth.state';
import { AuthActions } from '@features/auth/store/auth.actions';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, MatIconModule, MatDividerModule, MatMenuModule, MatButtonModule, Sidebar],
  templateUrl: './navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  private readonly router = inject(Router);
  private readonly store = inject(Store);

  public readonly isMobile = input<boolean>(true);

  readonly user = select(AuthState.user);

  readonly userName = computed(() => this.user()?.username ?? 'Guest');
  readonly userEmail = computed(() => this.user()?.email ?? '');

  public readonly profileActionEnum = ProfileActionEnum;

  public getUserInitials(): string {
    const username = this.user()?.username;
    if (!username) return 'GU';

    const names = username.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  }

  public handleProfileAction(action: string) {
    switch (action) {
      case ProfileActionEnum.SETTINGS:
        this.router.navigate(['/settings']);
        break;
      case ProfileActionEnum.SIGN_OUT:
        this.store.dispatch(new AuthActions.Logout());
        break;
    }
  }
}
