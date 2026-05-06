import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpHandlerFn,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '@core/services/notification.service';

/**
 * Error Interceptor - Handles all HTTP errors globally
 * Provides consistent error handling and user notifications
 */
export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 400:
            errorMessage = error.error?.message || 'Invalid request';
            break;
          case 401:
            errorMessage = 'Unauthorized. Please login again.';
            // Note: Don't logout here, let tokenRefreshInterceptor handle it
            break;
          case 403:
            errorMessage = 'You do not have permission to perform this action';
            break;
          case 404:
            errorMessage = error.error?.message || 'Resource not found';
            break;
          case 409:
            errorMessage = error.error?.message || 'Resource already exists';
            break;
          case 500:
            errorMessage = 'Internal server error. Please try again later.';
            break;
          case 503:
            errorMessage = 'Service temporarily unavailable. Please try again later.';
            break;
          default:
            errorMessage = error.error?.message || errorMessage;
        }
      }

      // Show error notification (unless explicitly skipped)
      if (!req.headers.has('X-Skip-Error-Notification')) {
        notificationService.showError(errorMessage);
      }

      // Return error for component-level handling if needed
      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        originalError: error,
      }));
    }),
  );
};
