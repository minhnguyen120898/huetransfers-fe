import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngxs/store';
import { withNgxsLoggerPlugin } from '@ngxs/logger-plugin';
import { withNgxsReduxDevtoolsPlugin } from '@ngxs/devtools-plugin';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';

import { routes } from './app.routes';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { tokenRefreshInterceptor } from '@core/interceptors/token-refresh.interceptor';
import { loadingInterceptor } from '@core/interceptors/loading.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { environment } from '@environments/environment';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { AuthState } from '@features/auth';
import { AgencyState } from '@features/agencies';
import { GuideState } from '@features/guides';
import { RestaurantState } from '@features/restaurants';
import { TransportProviderState } from '@features/transport-providers';
import { TourState } from '@features/tours';
import { BookingState } from '@features/bookings';
import { OperationState } from '@features/operations';
import { DebtState } from '@features/debt';
import { SettingsState } from '@features/settings';
import { MonthlyTransactionState } from '@features/monthly-transaction';
import { ProfitState } from '@features/profit';
import { CarBookingState } from '@features/car-services/store/bookings';
import { ExpenseState } from '@features/car-services/store/expenses';
import { CarBookingDebtState } from '@features/car-services/store/debt';
import { CarProfitState } from '@features/car-services/store/profit';
import { MonthFilterState } from '@core/store/month-filter';
import { UserManagementState } from '@features/users/store/user-management.state';
import { vi } from 'date-fns/locale';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([
        authInterceptor, // 1. Add auth token
        tokenRefreshInterceptor, // 2. Handle token refresh
        loadingInterceptor, // 3. Show/hide loading
        errorInterceptor, // 4. Handle errors
      ]),
    ),
    provideDateFnsAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: vi },
    provideStore(
      [
        AuthState,
        AgencyState,
        GuideState,
        RestaurantState,
        TransportProviderState,
        TourState,
        BookingState,
        OperationState,
        DebtState,
        SettingsState,
        MonthlyTransactionState,
        ProfitState,
        CarBookingState,
        ExpenseState,
        CarBookingDebtState,
        CarProfitState,
        MonthFilterState,
        UserManagementState,
      ], // NGXS States
      {
        developmentMode: !environment.production,
      },
      ...(environment.production ? [] : [withNgxsLoggerPlugin(), withNgxsReduxDevtoolsPlugin()]),
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
