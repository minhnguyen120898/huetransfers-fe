import { PaginationMeta } from '@core/models/api.model';
import { CarTransferDetail, CarTransferQueryParams } from '../../models/profit';

export namespace CarTransferActions {
  export class LoadCarTransfers {
    static readonly type = '[CarTransfer] Load Car Transfers';
    constructor(public params: CarTransferQueryParams) {}
  }

  export class LoadCarTransfersSuccess {
    static readonly type = '[CarTransfer] Load Car Transfers Success';
    constructor(
      public transfers: CarTransferDetail[],
      public meta: PaginationMeta,
    ) {}
  }

  export class LoadCarTransfersFailure {
    static readonly type = '[CarTransfer] Load Car Transfers Failure';
    constructor(public error: string) {}
  }

  export class ClearCarTransfers {
    static readonly type = '[CarTransfer] Clear Car Transfers';
  }
}
