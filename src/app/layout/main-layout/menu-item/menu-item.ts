import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MenuItemProps } from './menu-item.model';

@Component({
  selector: 'app-menu-item',
  imports: [CommonModule, RouterModule, MatIconModule, MatListModule, MatTooltipModule],
  templateUrl: './menu-item.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItem {
  public item = input.required<MenuItemProps>();
  public level = input<number>(0);
  public currentUrl = input<string>();
  public isCollapsed = input<boolean>(false);
  public menuExpansionState = input<Record<string, boolean>>({});
  public itemClick = output<MenuItemProps>();
  public toggleExpansion = output<MenuItemProps>();

  public readonly hasChildren = computed(() => {
    const item = this.item();
    return !!(item.children && item.children.length > 0);
  });

  public readonly isExpanded = computed(() => {
    const item = this.item();
    const expansionState = this.menuExpansionState();
    const itemKey = item.route || item.label;
    return expansionState[itemKey] || false;
  });

  private checkChildrenForActiveRoute(children: MenuItemProps[], currentPath: string): boolean {
    return children.some((child) => {
      if (child.route === currentPath) return true;
      if (child.children) return this.checkChildrenForActiveRoute(child.children, currentPath);
      return false;
    });
  }

  public readonly hasActiveChild = computed(() => {
    const item = this.item();
    const currentUrl = this.currentUrl();

    if (!item.children || !currentUrl) return false;

    const currentPath = currentUrl.split('?')[0];
    return this.checkChildrenForActiveRoute(item.children, currentPath);
  });

  public readonly isActive = computed(() => {
    const item = this.item();
    if (!item.route) return false;

    const currentUrl = this.currentUrl();
    if (!currentUrl) return false;

    const isCollapsed = this.isCollapsed();
    const isExpanded = this.isExpanded();

    // Extract pathname from current URL (remove query parameters)
    const currentPath = currentUrl.split('?')[0];
    const isCurrentItemActive = currentPath === item.route;

    // If current item is active, always show as active
    if (isCurrentItemActive) return true;

    // If sidebar is collapsed OR parent menu is collapsed (not expanded), show parent as active if has active child
    // If sidebar is expanded AND parent menu is expanded, only show actual active item as active
    if (!isCollapsed && isExpanded) return false;

    // Check if any child is active
    if (!item.children) return false;

    return this.checkChildrenForActiveRoute(item.children, currentPath);
  });

  public readonly itemPaddingLeft = computed(() => {
    const level = this.level();
    const isCollapsed = this.isCollapsed();

    // When collapsed, center the content
    if (isCollapsed && level === 0) {
      return '0';
    }

    if (level === 0) return '8px';
    if (level === 1) return '8px';
    return '24px';
  });

  public readonly showTooltip = computed(() => {
    return this.isCollapsed() && this.level() === 0;
  });

  public readonly itemClasses = computed(() => {
    const baseClasses = 'group side-nav-item transition-all duration-200';
    const collapsedClasses = this.isCollapsed() && this.level() === 0 ? 'justify-center' : '';
    return `${baseClasses} ${collapsedClasses}`;
  });

  public onItemClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (this.hasChildren() && !this.isCollapsed()) {
      this.toggleExpansion.emit(this.item());
    } else if (this.item().route) {
      this.itemClick.emit(this.item());
    }
  }

  public onChildItemClick(childItem: MenuItemProps) {
    this.itemClick.emit(childItem);
  }

  public onChildToggleExpansion(childItem: MenuItemProps) {
    this.toggleExpansion.emit(childItem);
  }
}
