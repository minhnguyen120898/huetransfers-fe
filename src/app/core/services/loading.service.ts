import { Injectable, signal, computed } from '@angular/core';

/**
 * Loading Service - Signal-based global loading state management
 * Tracks number of active HTTP requests and provides reactive loading state
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  // Track number of active requests
  private readonly activeRequests = signal<number>(0);

  // Public readonly computed signal
  readonly isLoading = computed(() => this.activeRequests() > 0);

  /**
   * Increment active requests counter (show loading)
   */
  show(): void {
    this.activeRequests.update((count) => count + 1);
  }

  /**
   * Decrement active requests counter (hide loading)
   */
  hide(): void {
    this.activeRequests.update((count) => Math.max(0, count - 1));
  }

  /**
   * Force reset all loading states (useful for cleanup)
   */
  reset(): void {
    this.activeRequests.set(0);
  }

  /**
   * Get current loading state (synchronous)
   */
  get loading(): boolean {
    return this.isLoading();
  }
}
