import { Observable } from 'rxjs';
import { CarMonthlyProfitSummary, CarProfitQueryParams } from '../../models/profit';

export interface ICarProfitDataService {
  readonly summary$: Observable<CarMonthlyProfitSummary | null>;
  readonly loading$: Observable<boolean>;
  readonly error$: Observable<string | null>;

  loadSummary(params: CarProfitQueryParams): void;
  refresh(): void;
}

export abstract class CarProfitDataService implements ICarProfitDataService {
  abstract readonly summary$: Observable<CarMonthlyProfitSummary | null>;
  abstract readonly loading$: Observable<boolean>;
  abstract readonly error$: Observable<string | null>;

  abstract loadSummary(params: CarProfitQueryParams): void;
  abstract refresh(): void;
}
