import { Signal, WritableSignal, signal, computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PaginationMeta } from '@core/models/api.model';

/**
 * Filter configuration
 */
export interface TableFilter {
  [key: string]: unknown;
}

/**
 * Sort configuration
 */
export interface TableSort {
  column: string;
  direction: 'asc' | 'desc';
}

/**
 * Abstract Table Data Source
 *
 * Follows SOLID Principles:
 * - Single Responsibility: Manages data fetching and state
 * - Open/Closed: Open for extension, closed for modification
 * - Liskov Substitution: Subclasses can replace this base class
 * - Dependency Inversion: Depends on abstractions (signals) not concrete implementations
 *
 * Proper Subscription Management:
 * - Use `protected readonly destroyRef` for automatic cleanup
 * - Pipe observables with `takeUntilDestroyed(this.destroyRef)`
 * - No memory leaks!
 *
 * @template T The type of data items in the table
 */
export abstract class AbstractTableDataSource<T> {
  /** Automatic cleanup for subscriptions */
  protected readonly destroyRef = inject(DestroyRef);

  // State signals
  protected readonly _data: WritableSignal<T[]> = signal([]);
  protected readonly _loading: WritableSignal<boolean> = signal(false);
  protected readonly _error: WritableSignal<string | null> = signal(null);
  protected readonly _meta: WritableSignal<PaginationMeta | null> = signal(null);
  protected readonly _selectedRows: WritableSignal<T[]> = signal([]);
  protected readonly _filters: WritableSignal<TableFilter> = signal({});
  protected readonly _sort: WritableSignal<TableSort | null> = signal(null);

  // Public readonly signals
  readonly data: Signal<T[]> = this._data.asReadonly();
  readonly loading: Signal<boolean> = this._loading.asReadonly();
  readonly error: Signal<string | null> = this._error.asReadonly();
  readonly meta: Signal<PaginationMeta | null> = this._meta.asReadonly();
  readonly selectedRows: Signal<T[]> = this._selectedRows.asReadonly();
  readonly filters: Signal<TableFilter> = this._filters.asReadonly();
  readonly sort: Signal<TableSort | null> = this._sort.asReadonly();

  // Computed signals
  readonly hasData = computed(() => this._data().length > 0);
  readonly isEmpty = computed(() => !this._loading() && this._data().length === 0);
  readonly hasError = computed(() => this._error() !== null);
  readonly hasSelection = computed(() => this._selectedRows().length > 0);
  readonly isAllSelected = computed(
    () => this._data().length > 0 && this._selectedRows().length === this._data().length,
  );

  /**
   * Load data with current filters, sort, and pagination
   * Must be implemented by subclasses
   */
  abstract loadData(page?: number, pageSize?: number): void;

  /**
   * Refresh data (reload with current parameters)
   */
  refresh(): void {
    const currentMeta = this._meta();
    const page = currentMeta?.page || 1;
    const pageSize = currentMeta?.limit || 10;
    this.loadData(page, pageSize);
  }

  /**
   * Update filters and reload data
   */
  setFilters(filters: TableFilter): void {
    this._filters.set(filters);
    this.loadData(1); // Reset to first page when filtering
  }

  /**
   * Update a single filter
   */
  setFilter(key: string, value: unknown): void {
    this._filters.update((current) => ({ ...current, [key]: value }));
    this.loadData(1);
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this._filters.set({});
    this.loadData(1);
  }

  /**
   * Update sort configuration
   */
  setSort(column: string, direction: 'asc' | 'desc'): void {
    this._sort.set({ column, direction });
    this.loadData(1); // Reset to first page when sorting
  }

  /**
   * Clear sort
   */
  clearSort(): void {
    this._sort.set(null);
    this.loadData(1);
  }

  /**
   * Select a single row
   */
  selectRow(row: T): void {
    this._selectedRows.update((current) => [...current, row]);
  }

  /**
   * Deselect a single row
   */
  deselectRow(row: T): void {
    this._selectedRows.update((current) =>
      current.filter((selected) => !this.areRowsEqual(selected, row)),
    );
  }

  /**
   * Toggle row selection
   */
  toggleRowSelection(row: T): void {
    const isSelected = this._selectedRows().some((selected) => this.areRowsEqual(selected, row));
    if (isSelected) {
      this.deselectRow(row);
    } else {
      this.selectRow(row);
    }
  }

  /**
   * Select all rows on current page
   */
  selectAll(): void {
    this._selectedRows.set([...this._data()]);
  }

  /**
   * Deselect all rows
   */
  deselectAll(): void {
    this._selectedRows.set([]);
  }

  /**
   * Toggle select all
   */
  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.deselectAll();
    } else {
      this.selectAll();
    }
  }

  /**
   * Check if a row is selected
   */
  isRowSelected(row: T): boolean {
    return this._selectedRows().some((selected) => this.areRowsEqual(selected, row));
  }

  /**
   * Compare two rows for equality
   * Override this method for custom comparison logic
   */
  protected areRowsEqual(row1: T, row2: T): boolean {
    // Default: use reference equality
    // Override this in subclasses for custom comparison (e.g., by ID)
    return row1 === row2;
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this._error.set(null);
  }

  /**
   * Set loading state
   */
  protected setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  /**
   * Set error state
   */
  protected setError(error: string): void {
    this._error.set(error);
    this._loading.set(false);
  }

  /**
   * Set data
   */
  protected setData(data: T[], meta?: PaginationMeta): void {
    this._data.set(data);
    if (meta) {
      this._meta.set(meta);
    }
    this._loading.set(false);
    this._error.set(null);
  }
}
