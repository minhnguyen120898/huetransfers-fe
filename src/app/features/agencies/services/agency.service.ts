import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '@core/services/base-http.service';
import {
  TravelAgency,
  CreateTravelAgencyDto,
  UpdateTravelAgencyDto,
} from '@core/models/partner.model';
import { PaginatedResponse, PaginationParams } from '@core/models/api.model';

export interface AgencyQueryParams extends PaginationParams {
  search?: string;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AgencyService extends BaseHttpService {
  private readonly endpoint = 'travel-agency';

  /**
   * Get all agencies with pagination and filtering
   */
  getAgencies(params?: AgencyQueryParams): Observable<PaginatedResponse<TravelAgency>> {
    const queryParams = params ? this.buildParams(params as Record<string, unknown>) : undefined;
    return this.get<PaginatedResponse<TravelAgency>>(
      this.endpoint,
      queryParams ? { params: queryParams } : undefined,
    );
  }

  /**
   * Get agency by ID
   */
  getAgencyById(id: string): Observable<TravelAgency> {
    return this.get<TravelAgency>(`${this.endpoint}/${id}`);
  }

  /**
   * Create new agency
   */
  createAgency(data: CreateTravelAgencyDto): Observable<TravelAgency> {
    return this.post<TravelAgency>(this.endpoint, data);
  }

  /**
   * Update agency
   */
  updateAgency(id: string, data: UpdateTravelAgencyDto): Observable<TravelAgency> {
    return this.put<TravelAgency>(`${this.endpoint}/${id}`, data);
  }

  /**
   * Delete agency (soft delete - deactivate)
   */
  deleteAgency(id: string): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Toggle agency active status
   */
  toggleActiveStatus(id: string, isActive: boolean): Observable<TravelAgency> {
    return this.updateAgency(id, { isActive });
  }
}
