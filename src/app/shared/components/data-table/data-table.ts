import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  TemplateRef,
  ContentChild,
  signal,
  inject,
  DestroyRef,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';

import { AbstractTableDataSource } from './models/abstract-table-datasource';
import { TableColumn } from './models/table-column.model';
import { TableAction } from './models/table-action.model';
import { FooterConfig } from './models/footer.model';
import { Pagination, PageEvent } from '@shared/components/pagination/pagination';
import { LoadingSpinner } from '@shared/components/loading-spinner/loading-spinner';
import { ErrorState } from '@shared/components/error-state/error-state';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { TooltipIfTruncatedDirective } from '@shared/directives';
import { formatDate, DateFormat } from '@core/config/date.config';

/**
 * Generic DataTable Component using Angular Material Table
 * Compatible with Angular 20, Material 20, and Tailwind CSS 4
 *
 * @template T The type of data items
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatChipsModule,
    Pagination,
    LoadingSpinner,
    ErrorState,
    EmptyState,
    TooltipIfTruncatedDirective,
  ],
  templateUrl: './data-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTable<T> implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  /** Mobile breakpoint in pixels */
  private readonly MOBILE_BREAKPOINT = 768;

  /** Signal to track if current screen is mobile (exposed for template) */
  readonly isMobile = signal(false);

  /** Data source for the table */
  @Input({ required: true }) dataSource!: AbstractTableDataSource<T>;

  /** Column definitions */
  @Input({ required: true }) columns: TableColumn<T>[] = [];

  /** Row actions (edit, delete, etc.) */
  @Input() actions: TableAction<T>[] = [];

  /** Function to determine row CSS classes based on row data */
  @Input() rowClass?: (row: T) => string;

  /** Enable row selection */
  @Input() selectable = false;

  /** Function to determine if a row should be disabled for selection */
  @Input() disableRowSelection?: (row: T) => boolean;

  /** Show pagination */
  @Input() paginated = true;

  /** Make actions column sticky to the right */
  @Input() stickyActions = false;

  /** Column keys to show in mobile card header (e.g., ['departureDate', 'status']) */
  @Input() mobileCardHeaderKeys: string[] = [];

  /** Number of columns to show when mobile card is collapsed */
  @Input() mobileCollapsedColumns = 4;

  /** Footer configuration - maps column keys to their footer values */
  @Input() footerConfig?: FooterConfig<T>;

  /** Custom CSS class for footer row */
  @Input() footerRowClass = 'bg-blue-50 font-semibold border-t-2 border-blue-200';

  @Input() mobileCardViewMode = false;

  /** Enable sticky header with scrollable body */
  @Input() stickyHeader = true;

  /** Make footer row sticky (stays visible when scrolling) */
  @Input() stickyFooter = true;

  /** Custom max-height class for table container when stickyHeader is enabled */
  @Input() tableMaxHeightClass = 'max-h-[calc(100vh-18rem)]';

  /** Empty state configuration */
  @Input() emptyStateIcon = 'inbox';
  @Input() emptyStateTitle = 'No data found';
  @Input() emptyStateMessage = 'There are no items to display.';
  @Input() emptyStateActionLabel?: string;

  /** Loading message */
  @Input() loadingMessage = 'Loading...';

  /** Error title */
  @Input() errorTitle = 'Failed to load data';

  /** Custom empty state action */
  @Output() emptyStateAction = new EventEmitter<void>();

  /** Row click event */
  @Output() rowClick = new EventEmitter<T>();

  /** Footer row click event */
  @Output() footerRowClick = new EventEmitter<void>();

  /** Custom action templates */
  @ContentChild('actionsTemplate') actionsTemplate?: TemplateRef<{ $implicit: T }>;

  ngOnInit(): void {
    this.initMobileDetection();
  }

  /**
   * Initialize mobile screen detection with resize listener
   */
  private initMobileDetection(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Check initial screen size
    this.checkMobile();

    // Listen for resize events
    const resizeHandler = () => this.checkMobile();
    window.addEventListener('resize', resizeHandler);

    // Cleanup on destroy
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('resize', resizeHandler);
    });
  }

  /**
   * Check if current screen width is mobile
   */
  private checkMobile(): void {
    this.isMobile.set(window.innerWidth <= this.MOBILE_BREAKPOINT);
  }

  /**
   * Get displayed column IDs (includes selection and actions)
   */
  get displayedColumns(): string[] {
    const cols: string[] = [];

    if (this.selectable) {
      cols.push('select');
    }

    this.columns.filter((col) => col.visible !== false).forEach((col) => cols.push(col.key));

    if (this.actions.length > 0 || this.actionsTemplate) {
      cols.push('actions');
    }

    return cols;
  }

  /**
   * Check if footer row should be displayed
   */
  get showFooterRow(): boolean {
    return this.footerConfig !== undefined;
  }

  /**
   * Get table container classes for sticky header
   */
  getTableContainerClasses(): string {
    if (!this.stickyHeader) {
      return '';
    }
    return 'overflow-auto';
  }

  /**
   * Get footer cell value for a column
   */
  getFooterCellValue(column: TableColumn<T>): string | number | boolean | null {
    if (!this.footerConfig) {
      return null;
    }

    const configValue = this.footerConfig[column.key];

    if (configValue === null || configValue === undefined) {
      return null;
    }

    if (typeof configValue === 'function') {
      const data = this.dataSource.data();
      return configValue(data);
    }

    return configValue;
  }

  /**
   * Format footer cell value for display
   */
  formatFooterCellValue(value: string | number | boolean | null, column: TableColumn<T>): string {
    if (value === null || value === undefined) {
      return '';
    }

    // Use column's format function if available
    if (column.format && typeof value !== 'boolean') {
      return column.format(value, {} as T); // Pass empty object as we don't have a row
    }

    // Default formatting based on column type
    switch (column.type) {
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : String(value);
      case 'boolean':
        return value ? 'Yes' : 'No';
      default:
        return String(value);
    }
  }

  /**
   * Check if all rows are selected (excluding disabled rows)
   */
  isAllSelected(): boolean {
    if (!this.disableRowSelection) {
      // No disabled rows, use default behavior
      return this.dataSource.isAllSelected();
    }

    const data = this.dataSource.data();
    const enabledRows = data.filter((row) => !this.isRowSelectionDisabled(row));

    if (enabledRows.length === 0) {
      return false;
    }

    const selectedRows = this.dataSource.selectedRows();
    return enabledRows.every((row) =>
      selectedRows.some((selected) => this.areRowsEqual(row, selected)),
    );
  }

  /**
   * Toggle all rows selection (excluding disabled rows)
   */
  toggleAllRows(): void {
    if (!this.disableRowSelection) {
      // No disabled rows, use default behavior
      this.dataSource.toggleSelectAll();
      return;
    }

    const data = this.dataSource.data();
    const enabledRows = data.filter((row) => !this.isRowSelectionDisabled(row));

    if (enabledRows.length === 0) {
      // All rows disabled, do nothing
      return;
    }

    // Check if all enabled rows are selected
    const selectedRows = this.dataSource.selectedRows();
    const allEnabledSelected = enabledRows.every((row) =>
      selectedRows.some((selected) => this.areRowsEqual(row, selected)),
    );

    if (allEnabledSelected) {
      // Deselect all enabled rows
      this.dataSource.deselectAll();
    } else {
      // Select all enabled rows
      const currentlySelected = selectedRows.filter((row) => this.isRowSelectionDisabled(row));
      this.dataSource['_selectedRows'].set([...currentlySelected, ...enabledRows]);
    }
  }

  /**
   * Compare two rows for equality (delegates to datasource)
   */
  private areRowsEqual(row1: T, row2: T): boolean {
    return this.dataSource['areRowsEqual'](row1, row2);
  }

  /**
   * Check if some but not all rows are selected (excluding disabled rows)
   */
  isIndeterminate(): boolean {
    if (!this.disableRowSelection) {
      // No disabled rows, use default behavior
      return this.dataSource.hasSelection() && !this.dataSource.isAllSelected();
    }

    const data = this.dataSource.data();
    const enabledRows = data.filter((row) => !this.isRowSelectionDisabled(row));

    if (enabledRows.length === 0) {
      return false;
    }

    const selectedRows = this.dataSource.selectedRows();
    const selectedEnabledCount = enabledRows.filter((row) =>
      selectedRows.some((selected) => this.areRowsEqual(row, selected)),
    ).length;

    return selectedEnabledCount > 0 && selectedEnabledCount < enabledRows.length;
  }

  /**
   * Get cell value using column accessor
   */
  getCellValue(row: T, column: TableColumn<T>): unknown {
    if (column.accessor) {
      return column.accessor(row);
    }
    return (row as Record<string, unknown>)[column.key];
  }

  /**
   * Get cell CSS classes
   */
  getCellClass(row: T, column: TableColumn<T>): string {
    if (typeof column.cellClass === 'function') {
      return column.cellClass(row);
    }
    return column.cellClass || '';
  }

  /**
   * Get row CSS classes
   * Includes default striping (odd/even) and custom row classes
   */
  getRowClass(row: T, index: number): string {
    // Default striping
    const stripingClass = index % 2 === 0 ? 'table-row-even' : 'table-row-odd';

    // Custom row class (if provided)
    const customClass = this.rowClass ? this.rowClass(row) : '';

    // Combine classes
    return `${stripingClass} ${customClass}`.trim();
  }

  /**
   * Format cell value for display
   */
  formatCellValue(value: unknown, row: T, column: TableColumn<T>): string {
    if (column.format) {
      return column.format(value, row);
    }

    switch (column.type) {
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'date':
        return formatDate(value as Date | string | number, DateFormat.DATETIME_SHORT);
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : String(value || '0');
      default:
        return String(value || '');
    }
  }

  /**
   * Get the row index (1-based, accounting for pagination)
   */
  getRowIndex(row: T): number {
    const data = this.dataSource.data();
    const rowIndexInCurrentPage = data.indexOf(row);

    const meta = this.dataSource.meta();
    if (meta && this.paginated) {
      return (meta.page - 1) * meta.limit + rowIndexInCurrentPage + 1;
    }

    return rowIndexInCurrentPage + 1;
  }

  /**
   * Format date value for display
   */
  formatDateValue(value: unknown): string {
    return formatDate(value as Date | string | number, DateFormat.DATETIME_SHORT);
  }

  /**
   * Get badge configuration for badge columns
   */
  getBadgeConfig(value: unknown, column: TableColumn<T>): { label: string; class: string } {
    const config = column.badgeConfig;
    if (!config) {
      return { label: String(value), class: '' };
    }

    const stringValue = String(value);
    const label = config.labelMap?.[stringValue] || stringValue;
    const colorClass = config.colorMap[stringValue] || '';

    return { label, class: colorClass };
  }

  /**
   * Check if action is visible for row
   */
  isActionVisible(action: TableAction<T>, row: T): boolean {
    return action.visible ? action.visible(row) : true;
  }

  /**
   * Check if action is disabled for row
   */
  isActionDisabled(action: TableAction<T>, row: T): boolean {
    return action.disabled ? action.disabled(row) : false;
  }

  /**
   * Get tooltip text for action
   */
  getActionTooltip(action: TableAction<T>, row: T): string {
    if (!action.tooltip) return '';
    return typeof action.tooltip === 'function' ? action.tooltip(row) : action.tooltip;
  }

  /**
   * Handle action click
   */
  onActionClick(action: TableAction<T>, row: T, event: Event): void {
    event.stopPropagation();
    if (!this.isActionDisabled(action, row)) {
      action.handler(row);
    }
  }

  /**
   * Handle row click
   */
  onRowClick(row: T): void {
    this.rowClick.emit(row);
  }

  /**
   * Handle footer row click
   */
  onFooterRowClick(): void {
    this.footerRowClick.emit();
  }

  /**
   * Handle page change
   */
  onPageChange(event: PageEvent): void {
    this.dataSource.loadData(event.page, event.pageSize);
  }

  /**
   * Check if row selection is disabled
   */
  isRowSelectionDisabled(row: T): boolean {
    return this.disableRowSelection ? this.disableRowSelection(row) : false;
  }

  /**
   * Check if all rows are disabled (for disabling "select all" checkbox)
   */
  areAllRowsDisabled(): boolean {
    if (!this.disableRowSelection) return false;
    const data = this.dataSource.data();
    if (data.length === 0) return true;
    return data.every((row) => this.isRowSelectionDisabled(row));
  }

  /**
   * Handle row selection toggle
   */
  onRowSelectionToggle(row: T): void {
    if (!this.isRowSelectionDisabled(row)) {
      this.dataSource.toggleRowSelection(row);
    }
  }

  /**
   * Handle empty state action
   */
  onEmptyStateAction(): void {
    this.emptyStateAction.emit();
  }

  /**
   * Handle retry after error
   */
  onRetry(): void {
    this.dataSource.refresh();
  }

  /**
   * Check if sticky actions should be applied (disabled on mobile)
   */
  private shouldApplyStickyActions(): boolean {
    return this.stickyActions && !this.isMobile();
  }

  /**
   * Get action header classes (with sticky support - disabled on mobile)
   */
  getActionHeaderClasses(): string {
    const baseClasses =
      '!px-4 !py-3 !text-xs !font-medium !text-gray-500 !uppercase !tracking-wider !text-right';

    if (this.shouldApplyStickyActions()) {
      return `sticky right-0 z-20 !bg-gray-50 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.1)] ${baseClasses}`;
    }

    return baseClasses;
  }

  /**
   * Get action cell classes (with sticky support - disabled on mobile)
   */
  getActionCellClasses(): string {
    const baseClasses = '!px-4 !py-4 !text-right';

    if (this.shouldApplyStickyActions()) {
      return `sticky right-0 z-10 bg-white group-hover:bg-gray-50 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.1)] transition-colors ${baseClasses}`;
    }

    return baseClasses;
  }

  /**
   * Get action footer cell classes (with sticky support - disabled on mobile)
   */
  getActionFooterCellClasses(): string {
    const baseClasses = '!px-4 !py-4 !text-right';

    if (this.shouldApplyStickyActions()) {
      return `sticky right-0 z-10 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.1)] ${baseClasses}`;
    }

    return baseClasses;
  }

  /**
   * Track by function for rows
   */
  trackByFn = (index: number, row: T): unknown => {
    const rowWithId = row as Record<string, unknown>;
    return rowWithId['id'] || index;
  };

  // ===== Mobile Card View Methods =====

  /** Track expanded state for each row by index */
  private readonly expandedRows = signal<Set<number>>(new Set());

  /**
   * Get column by key for mobile card rendering
   */
  getColumnByKey(key: string): TableColumn<T> | undefined {
    return this.columns.find((col) => col.key === key);
  }

  /**
   * Get columns for mobile card header (configurable via mobileCardHeaderKeys input)
   */
  getMobileCardHeaderColumns(): TableColumn<T>[] {
    return this.mobileCardHeaderKeys
      .map((key) => this.getColumnByKey(key))
      .filter((col): col is TableColumn<T> => col !== undefined && col.visible !== false);
  }

  /**
   * Get visible columns for card body (excluding STT and header columns)
   */
  getMobileCardColumns(): TableColumn<T>[] {
    const excludeKeys = ['stt', ...this.mobileCardHeaderKeys];
    return this.columns.filter(
      (col) => col.visible !== false && !excludeKeys.includes(col.key) && col.type !== 'stt',
    );
  }

  /**
   * Get columns to display for a card based on expanded state
   */
  getMobileCardDisplayColumns(rowIndex: number): TableColumn<T>[] {
    const allColumns = this.getMobileCardColumns();
    if (this.isRowExpanded(rowIndex)) {
      return allColumns;
    }
    return allColumns.slice(0, this.mobileCollapsedColumns);
  }

  /**
   * Check if a row has more columns than the collapsed limit
   */
  hasMoreColumns(): boolean {
    return this.getMobileCardColumns().length > this.mobileCollapsedColumns;
  }

  /**
   * Check if a row is expanded
   */
  isRowExpanded(rowIndex: number): boolean {
    return this.expandedRows().has(rowIndex);
  }

  /**
   * Toggle row expanded state
   */
  toggleRowExpanded(rowIndex: number, event: Event): void {
    event.stopPropagation();
    const current = this.expandedRows();
    const newSet = new Set(current);
    if (newSet.has(rowIndex)) {
      newSet.delete(rowIndex);
    } else {
      newSet.add(rowIndex);
    }
    this.expandedRows.set(newSet);
  }
}
