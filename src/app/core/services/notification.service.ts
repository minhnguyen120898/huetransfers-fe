import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

/**
 * Notification Service - Display toast notifications using Material Snackbar
 * Provides consistent notification patterns across the application
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  private readonly defaultConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  };

  /**
   * Show success notification (green)
   */
  showSuccess(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Close', {
      ...this.defaultConfig,
      duration,
      panelClass: ['snackbar-success'],
    });
  }

  /**
   * Show error notification (red)
   */
  showError(message: string, duration: number = 5000): void {
    this.snackBar.open(message, 'Close', {
      ...this.defaultConfig,
      duration,
      panelClass: ['snackbar-error'],
    });
  }

  /**
   * Show warning notification (orange)
   */
  showWarning(message: string, duration: number = 4000): void {
    this.snackBar.open(message, 'Close', {
      ...this.defaultConfig,
      duration,
      panelClass: ['snackbar-warning'],
    });
  }

  /**
   * Show info notification (blue)
   */
  showInfo(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Close', {
      ...this.defaultConfig,
      duration,
      panelClass: ['snackbar-info'],
    });
  }

  /**
   * Show notification with custom configuration
   */
  show(message: string, action: string = 'Close', config?: MatSnackBarConfig): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      ...config,
    });
  }

  /**
   * Dismiss all active notifications
   */
  dismiss(): void {
    this.snackBar.dismiss();
  }
}
