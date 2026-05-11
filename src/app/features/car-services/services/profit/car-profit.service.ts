import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '@core/services/base-http.service';
import {
  CarMonthlyProfitSummary,
  CarProfitQueryParams,
  CarTransferQueryParams,
  PaginatedCarTransfers,
} from '../../models/profit';

@Injectable({
  providedIn: 'root',
})
export class CarProfitService extends BaseHttpService {
  private readonly endpoint = 'profit';

  getCarProfitSummary(params: CarProfitQueryParams): Observable<CarMonthlyProfitSummary> {
    const httpParams = this.buildParams({ ...params });
    return this.get<CarMonthlyProfitSummary>(`${this.endpoint}/car-summary`, {
      params: httpParams,
    });
  }

  getCarTransfers(params: CarTransferQueryParams): Observable<PaginatedCarTransfers> {
    const httpParams = this.buildParams({ ...params });
    return this.get<PaginatedCarTransfers>(`${this.endpoint}/car-transfers`, {
      params: httpParams,
    });
  }
}
