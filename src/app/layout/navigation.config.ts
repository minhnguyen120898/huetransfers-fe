import { MenuItemProps } from './main-layout/menu-item/menu-item.model';

export const NAVIGATION_ITEMS: MenuItemProps[] = [
  {
    icon: 'tour',
    label: 'Tours',
    route: '/tours',
  },
  // Uncomment and add routes as you create feature components
  {
    icon: 'people',
    label: 'Users',
    route: '/users',
    adminOnly: true,
  },
  {
    icon: 'handshake',
    label: 'Partners',
    route: 'partners',
    children: [
      {
        icon: 'business',
        label: 'Travel Agencies',
        route: '/travel-agencies',
      },
      {
        icon: 'person_pin',
        label: 'Guides',
        route: '/guides',
      },
      {
        icon: 'restaurant',
        label: 'Restaurants',
        route: '/restaurants',
      },
      {
        icon: 'directions_bus',
        label: 'Transport Providers',
        route: '/transport-providers',
      },
    ],
  },
  {
    icon: 'book_online',
    label: 'Bookings & Operations',
    route: '/bookings',
  },
  {
    icon: 'directions_car',
    label: 'Car Services',
    route: '/car-services',
    hidden: true, // Hidden from sidebar (admin-only, accessible via direct URL)
  },
  {
    icon: 'account_balance',
    label: 'Debt Management',
    route: '/debt',
  },
  {
    icon: 'receipt_long',
    label: 'Monthly Transactions',
    route: '/monthly-transactions',
  },
  {
    icon: 'payments',
    label: 'Profit Summary',
    route: '/profit',
  },
  {
    icon: 'settings',
    label: 'Settings',
    route: '/settings',
  },
];
