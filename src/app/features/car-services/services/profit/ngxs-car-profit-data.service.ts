import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';
import { ICarProfitDataService } from './car-profit-data.service';
import { CarProfitState } from '../../store/profit/car-profit.state';
import { CarProfitActions } from '../../store/profit/car-profit.actions';
import { CarMonthlyProfitSummary, CarProfitQueryParams } from '../../models/profit';

@Injectable()
export class NgxsCarProfitDataService implements ICarProfitDataService {
  private readonly store = inject(Store);
  private currentParams: CarProfitQueryParams | null = null;

  readonly summary$: Observable<CarMonthlyProfitSummary | null> = this.store.select(
    CarProfitState.summary,
  );
  readonly loading$: Observable<boolean> = this.store.select(CarProfitState.loading);
  readonly error$: Observable<string | null> = this.store.select(CarProfitState.error);

  loadSummary(params: CarProfitQueryParams): void {
    this.currentParams = params;
    this.store.dispatch(new CarProfitActions.LoadCarProfitSummary(params));
  }

  refresh(): void {
    if (!this.currentParams) {
      return;
    }
    this.store.dispatch(new CarProfitActions.LoadCarProfitSummary(this.currentParams));
  }
}
