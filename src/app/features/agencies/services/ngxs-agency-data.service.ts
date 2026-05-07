import { Injectable, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import {
  TravelAgency,
  CreateTravelAgencyDto,
  UpdateTravelAgencyDto,
} from '@core/models/partner.model';
import { PaginatedResponse } from '@core/models/api.model';
import { AgencyDataService } from './agency-data.service';
import { AgencyState } from '../store/agency.state';
import { AgencyActions } from '../store/agency.actions';
import { AgencyQueryParams } from './agency.service';

/**
 * NGXS Implementation of AgencyDataService
 *
 * Benefits:
 * ✅ Implements abstraction - easy to swap with other implementations
 * ✅ Isolated NGXS logic - only this class knows about NGXS
 * ✅ Easy to test - can mock AgencyDataService interface
 * ✅ No subscriptions in constructor - just exposes observables
 * ✅ Single Responsibility - bridges NGXS and DataSource
 */
@Injectable()
export class NgxsAgencyDataService implements AgencyDataService {
  private readonly store = inject(Store);

  // Expose NGXS selectors as observables
  readonly agencies$ = this.store.select(AgencyState.agencies);
  readonly loading$ = this.store.select(AgencyState.loading);
  readonly error$ = this.store.select(AgencyState.error);
  readonly meta$ = this.store.select(AgencyState.meta);

  loadAgencies(params?: AgencyQueryParams): void {
    this.store.dispatch(new AgencyActions.LoadAgencies(params));
  }

  refresh(): void {
    // Get current meta to preserve page/pageSize
    const currentMeta = this.store.selectSnapshot(AgencyState.meta);
    this.loadAgencies({
      page: currentMeta?.page || 1,
      limit: currentMeta?.limit || 10,
    });
  }

  createAgency(data: CreateTravelAgencyDto): void {
    this.store.dispatch(new AgencyActions.CreateAgency(data));
  }

  updateAgency(id: string, data: UpdateTravelAgencyDto): void {
    this.store.dispatch(new AgencyActions.UpdateAgency(id, data));
  }

  deleteAgency(id: string): void {
    this.store.dispatch(new AgencyActions.DeleteAgency(id));
  }

  toggleActiveStatus(id: string, isActive: boolean): void {
    this.store.dispatch(new AgencyActions.ToggleAgencyActiveStatus(id, isActive));
  }
}
