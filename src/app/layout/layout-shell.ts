import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MainLayout } from './main-layout/main-layout';
import { NAVIGATION_ITEMS } from './navigation.config';
import { Store } from '@ngxs/store';
import { AuthState } from '@features/auth';
import { UserRole } from '@core/models';

@Component({
  selector: 'app-layout-shell',
  imports: [MainLayout],
  template: `<app-main-layout [navigationItems]="navigationItems" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutShell {
  readonly navigationItems;
  private store = inject(Store);
  private user = this.store.selectSnapshot(AuthState.user);
  private isAdmin = this.user?.role === UserRole.ADMIN;

  constructor() {
    this.navigationItems = NAVIGATION_ITEMS.filter((item) => !item.adminOnly || this.isAdmin).map(
      (item) => {
        if (item.route?.includes('/car-services') && this.isAdmin) {
          return { ...item, hidden: false };
        }
        return item;
      },
    );
  }
}
