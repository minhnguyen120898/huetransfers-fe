import { inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractTableDataSource } from '@shared/components/data-table/models';
import {
  TravelAgency,
  CreateTravelAgencyDto,
  UpdateTravelAgencyDto,
} from '@core/models/partner.model';
import { AgencyDataService } from './agency-data.service';

/**
 * ✅ Type-safe filter interface
 * Avoids unsafe type assertions in loadData
 */
export interface AgencyTableFilters {
  search?: string;
  isActive?: boolean;
}

/**
 * Agency Table Data Source
 *
 * ✅ Proper Implementation Following SOLID Principles:
 *
 * 1. Dependency Inversion:
 *    - Depends on IAgencyDataService interface (not concrete NGXS Store)
 *    - Easy to swap implementations (NGXS, Signal Store, RxJS, etc.)
 *
 * 2. Single Responsibility:
 *    - Only bridges data service and table UI
 *    - No knowledge of NGXS, Store, Actions, etc.
 *
 * 3. Encapsulation:
 *    - dataService is private
 *    - Exposes only necessary operations through public API
 *    - Component doesn't need to know about internal data service
 *
 * 4. Proper Subscription Management:
 *    - Uses takeUntilDestroyed() for automatic cleanup
 *    - No memory leaks!
 *    - Lightweight constructor
 *
 * 5. Easy to Test:
 *    - Mock IAgencyDataService interface
 *    - No need for real Store or NGXS setup
 *
 * Usage:
 * ```typescript
 * // In component
 * providers: [
 *   AgencyTableDataSource,
 *   { provide: AgencyDataService, useClass: NgxsAgencyDataService }
 * ]
 *
 * const dataSource = inject(AgencyTableDataSource);
 * dataSource.loadData();
 * dataSource.toggleActiveStatus(id, true); // ✅ Clean API
 * ```
 */
@Injectable()
export class AgencyTableDataSource extends AbstractTableDataSource<TravelAgency> {
  // ✅ Private - components shouldn't access this directly
  private readonly dataService = inject(AgencyDataService);

  constructor() {
    super();
    // ✅ Lightweight constructor - just call initialization
    this.connectToDataService();
  }

  /**
   * Connect to data service streams
   * ✅ Proper subscription management with takeUntilDestroyed
   */
  private connectToDataService(): void {
    // Sync data service observables to signals
    // ✅ Automatically unsubscribed when component is destroyed
    this.dataService.agencies$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((agencies) => this._data.set(agencies));

    this.dataService.loading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loading) => this._loading.set(loading));

    this.dataService.error$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((error) => this._error.set(error));

    this.dataService.meta$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((meta) => this._meta.set(meta));
  }

  /**
   * Load agencies data
   * ✅ Type-safe filters - no unsafe type assertions
   * Only includes defined filter values to avoid sending "undefined" strings to API
   */
  override loadData(page = 1, pageSize = 10): void {
    const filters = this.filters() as AgencyTableFilters;
    const sort = this.sort();

    // Build params object, only including defined values
    const params: any = {
      page,
      limit: pageSize,
    };

    if (filters.search) {
      params.search = filters.search;
    }

    if (filters.isActive !== undefined) {
      params.isActive = filters.isActive;
    }

    // Add sort when API supports it
    // if (sort?.column) {
    //   params.sortBy = sort.column;
    //   params.sortOrder = sort.direction;
    // }

    this.dataService.loadAgencies(params);
  }

  /**
   * Refresh data
   */
  override refresh(): void {
    this.dataService.refresh();
  }

  /**
   * ✅ Public API: Toggle agency active status
   * Component uses this instead of accessing dataService directly
   */
  toggleActiveStatus(id: string, isActive: boolean): void {
    this.dataService.toggleActiveStatus(id, isActive);
  }

  /**
   * ✅ Public API: Delete agency
   * Component uses this instead of accessing dataService directly
   */
  deleteAgency(id: string): void {
    this.dataService.deleteAgency(id);
  }

  /**
   * ✅ Public API: Create agency
   * Component uses this instead of accessing dataService directly
   */
  createAgency(data: CreateTravelAgencyDto): void {
    this.dataService.createAgency(data);
  }

  /**
   * ✅ Public API: Update agency
   * Component uses this instead of accessing dataService directly
   */
  updateAgency(id: string, data: UpdateTravelAgencyDto): void {
    this.dataService.updateAgency(id, data);
  }

  /**
   * Compare agencies by ID for selection
   */
  protected override areRowsEqual(row1: TravelAgency, row2: TravelAgency): boolean {
    return row1.id === row2.id;
  }
}
