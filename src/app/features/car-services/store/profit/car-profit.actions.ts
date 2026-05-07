import { CarProfitQueryParams } from '../../models/profit';

export namespace CarProfitActions {
  export class LoadCarProfitSummary {
    static readonly type = '[CarProfit] Load Car Profit Summary';
    constructor(public params: CarProfitQueryParams) {}
  }

  export class ClearCarProfitData {
    static readonly type = '[CarProfit] Clear Car Profit Data';
  }

  export class ClearError {
    static readonly type = '[CarProfit] Clear Error';
  }
}
