import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { MenuItem } from './menu-item/menu-item';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDrawerMode, MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MenuItemProps } from './menu-item/menu-item.model';
import { filter } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Navbar } from './navbar/navbar';
import { Sidebar } from './sidebar/sidebar';

@Component({
  selector: 'app-main-layout',
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatTooltipModule,
    MatIconModule,
    MatButtonModule,
    MenuItem,
    Navbar,
    Sidebar,
  ],
  templateUrl: './main-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayout implements OnInit, AfterViewInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  public readonly navigationItems = input<MenuItemProps[]>([]);

  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  public readonly currentUrl = signal(this.router.url);
  public readonly isSmallScreen = signal(false);
  public readonly isCollapsed = signal(false);
  public readonly menuExpansionState = signal<Record<string, boolean>>({});

  public readonly sidenavMode = computed<MatDrawerMode>(() =>
    this.isSmallScreen() ? 'over' : 'side',
  );

  public readonly sidenavWidth = computed(() => {
    if (this.isSmallScreen()) {
      return this.isCollapsed() ? '64px' : '320px';
    }
    return this.isCollapsed() ? '64px' : '256px';
  });

  public readonly sidenavClass = computed(() => {
    const baseClasses = 'sidenav-container transition-all duration-300 ease-in-out';
    return `${baseClasses} ${this.isCollapsed() ? 'collapsed' : 'expanded'}`;
  });

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.currentUrl.set(this.router.url);
        this.expandActiveMenuItems();
      });
  }

  public ngOnInit() {
    // Expand active menu items on initial load (after inputs are set)
    this.expandActiveMenuItems();
  }

  public ngAfterViewInit() {
    this.breakpointObserver
      .observe(['(max-width: 1023px)'])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result.matches) {
          this.isSmallScreen.set(true);
          this.isCollapsed.set(false);
          this.sidenav.close();
        } else {
          this.isSmallScreen.set(false);
          this.sidenav.open();
        }
      });
  }

  public toggleSidenav() {
    this.sidenav.toggle();
  }

  public toggleCollapse() {
    if (!this.isSmallScreen()) {
      this.isCollapsed.set(!this.isCollapsed());
      // Close expanded menu items when collapsing
      if (this.isCollapsed()) {
        this.collapseAllMenuItems();
      }
    }
  }

  public closeSidenav() {
    if (this.sidenavMode() === 'over') {
      this.sidenav.close();
    }
  }

  public toggleMenuItem(item: MenuItemProps) {
    if (item.children && item.children.length > 0) {
      // Don't allow expansion when collapsed
      if (!this.isCollapsed()) {
        const currentState = this.menuExpansionState();
        const itemKey = this.getItemKey(item);
        this.menuExpansionState.set({
          ...currentState,
          [itemKey]: !currentState[itemKey],
        });
      }
    }
  }

  public navigateToRoute(item: MenuItemProps) {
    if (item.route) {
      this.router.navigate([item.route]);
      this.closeSidenav();
    }
  }

  private getItemKey(item: MenuItemProps): string {
    return item.route || item.label;
  }

  private expandActiveMenuItems() {
    const currentPath = this.router.url.split('?')[0];
    const currentState = this.menuExpansionState();
    const newState = { ...currentState };

    const expandItems = (items: MenuItemProps[]): boolean => {
      let hasActiveChild = false;

      items.forEach((item) => {
        if (item.children) {
          const childHasActive = expandItems(item.children);
          if (childHasActive) {
            const itemKey = this.getItemKey(item);
            newState[itemKey] = true;
            hasActiveChild = true;
          }
        } else if (item.route === currentPath) {
          hasActiveChild = true;
        }
      });

      return hasActiveChild;
    };

    expandItems(this.navigationItems());
    this.menuExpansionState.set(newState);
  }

  private collapseAllMenuItems() {
    this.menuExpansionState.set({});
  }
}
