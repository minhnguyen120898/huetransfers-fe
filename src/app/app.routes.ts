import { Routes } from '@angular/router';
import { authGuard, guestGuard, forceChangePasswordGuard, adminGuard } from '@features/auth';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/tours',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
      },
      {
        path: 'forgot-password',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./features/auth/forgot-password/forgot-password').then((m) => m.ForgotPassword),
      },
      {
        path: 'reset-password',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./features/auth/reset-password/reset-password').then((m) => m.ResetPassword),
      },
      {
        path: 'force-change-password',
        loadComponent: () =>
          import('./features/auth/force-change-password/force-change-password').then(
            (m) => m.ForceChangePassword,
          ),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    canActivate: [authGuard, forceChangePasswordGuard],
    loadComponent: () => import('./layout/layout-shell').then((m) => m.LayoutShell),
    children: [
      // {
      //   path: 'dashboard',
      //   loadComponent: () =>
      //     import('./features/dashboard/dashboard').then((m) => m.DashboardComponent),
      // },
      {
        path: 'tours',
        loadComponent: () => import('./features/tours').then((m) => m.TourListComponent),
      },
      {
        path: 'travel-agencies',
        loadComponent: () => import('./features/agencies').then((m) => m.AgencyListComponent),
      },
      {
        path: 'guides',
        loadComponent: () => import('./features/guides').then((m) => m.GuideListComponent),
      },
      {
        path: 'restaurants',
        loadComponent: () =>
          import('./features/restaurants').then((m) => m.RestaurantListComponent),
      },
      {
        path: 'transport-providers',
        loadComponent: () =>
          import('./features/transport-providers').then((m) => m.TransportProviderListComponent),
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./features/bookings/components/booking-tab/booking-tab').then(
            (m) => m.BookingTab,
          ),
      },
      {
        path: 'debt',
        loadComponent: () =>
          import('./features/debt/components/debt-tab/debt-tab').then((m) => m.DebtTab),
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings').then((m) => m.SettingsPageComponent),
      },
      {
        path: 'monthly-transactions',
        loadComponent: () =>
          import('./features/monthly-transaction').then((m) => m.MonthlyTransactionListComponent),
      },
      {
        path: 'profit',
        loadComponent: () => import('./features/profit').then((m) => m.ProfitSummary),
      },
      {
        path: 'car-services',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/car-services/car-services-tab').then((m) => m.CarServicesTab),
      },
      {
        path: 'users',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/users').then((m) => m.UserListComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/tours',
  },
];
