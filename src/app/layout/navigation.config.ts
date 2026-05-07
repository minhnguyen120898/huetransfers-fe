import { MenuItemProps } from './main-layout/menu-item/menu-item.model';

export const NAVIGATION_ITEMS: MenuItemProps[] = [
  {
    icon: 'directions_car',
    label: 'Car Services',
    route: '/car-services',
    adminOnly: true,
  },
  {
    icon: 'business',
    label: 'Travel Agencies',
    route: '/travel-agencies',
  },
  {
    icon: 'people',
    label: 'Users',
    route: '/users',
    adminOnly: true,
  },
  {
    icon: 'settings',
    label: 'Settings',
    route: '/settings',
  },
];
