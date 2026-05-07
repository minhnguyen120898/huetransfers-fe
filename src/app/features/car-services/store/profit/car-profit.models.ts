import { CarMonthlyProfitSummary, CarProfitQueryParams } from '../../models/profit';

export interface CarProfitStateModel {
  summary: CarMonthlyProfitSummary | null;
  loading: boolean;
  error: string | null;
  currentParams: CarProfitQueryParams | null;
}
