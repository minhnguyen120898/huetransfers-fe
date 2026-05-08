import { Routes } from '@angular/router';
import { authGuard, guestGuard, forceChangePasswordGuard, adminGuard } from '@features/auth';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/car-services',
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
      {
        path: 'travel-agencies',
        loadComponent: () => import('./features/agencies').then((m) => m.AgencyListComponent),
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings').then((m) => m.SettingsPageComponent),
      },
      {
        path: 'car-services',
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
    redirectTo: '/car-services',
  },
];
