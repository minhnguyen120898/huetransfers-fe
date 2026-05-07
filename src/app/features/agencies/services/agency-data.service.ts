import { Observable } from 'rxjs';
import {
  TravelAgency,
  CreateTravelAgencyDto,
  UpdateTravelAgencyDto,
} from '@core/models/partner.model';
import { PaginationMeta } from '@core/models/api.model';
import { AgencyQueryParams } from './agency.service';

/**
 * Agency Data Service Interface
 *
 * ✅ Pure Interface (Dependency Inversion Principle):
 * - High-level modules (TableDataSource) depend on this interface
 * - Low-level modules (NgxsAgencyDataService) implement this interface
 * - Easy to swap implementations (NGXS, RxJS, Signal Store, etc.)
 * - Easy to mock for testing
 * - No implementation details - just a contract
 */
export interface IAgencyDataService {
  /** Stream of agencies data */
  readonly agencies$: Observable<TravelAgency[]>;

  /** Stream of loading state */
  readonly loading$: Observable<boolean>;

  /** Stream of error state */
  readonly error$: Observable<string | null>;

  /** Stream of pagination metadata */
  readonly meta$: Observable<PaginationMeta | null>;

  /**
   * Load agencies with parameters
   * Should dispatch action or trigger data fetch
   */
  loadAgencies(params?: AgencyQueryParams): void;

  /**
   * Refresh agencies data
   */
  refresh(): void;

  /**
   * Create a new agency
   */
  createAgency(data: CreateTravelAgencyDto): void;

  /**
   * Update an existing agency
   */
  updateAgency(id: string, data: UpdateTravelAgencyDto): void;

  /**
   * Delete an agency
   */
  deleteAgency(id: string): void;

  /**
   * Toggle agency active status
   */
  toggleActiveStatus(id: string, isActive: boolean): void;
}

/**
 * Token for dependency injection
 * Use this token in providers to bind interface to implementation
 */
export abstract class AgencyDataService implements IAgencyDataService {
  abstract readonly agencies$: Observable<TravelAgency[]>;
  abstract readonly loading$: Observable<boolean>;
  abstract readonly error$: Observable<string | null>;
  abstract readonly meta$: Observable<PaginationMeta | null>;
  abstract loadAgencies(params?: AgencyQueryParams): void;
  abstract refresh(): void;
  abstract createAgency(data: CreateTravelAgencyDto): void;
  abstract updateAgency(id: string, data: UpdateTravelAgencyDto): void;
  abstract deleteAgency(id: string): void;
  abstract toggleActiveStatus(id: string, isActive: boolean): void;
}
