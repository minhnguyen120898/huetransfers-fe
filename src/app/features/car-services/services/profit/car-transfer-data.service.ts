import { Observable } from 'rxjs';
import { PaginationMeta } from '@core/models/api.model';
import { CarTransferDetail, CarTransferQueryParams } from '../../models/profit';

export abstract class CarTransferDataService {
  abstract readonly transfers$: Observable<CarTransferDetail[]>;
  abstract readonly loading$: Observable<boolean>;
  abstract readonly error$: Observable<string | null>;
  abstract readonly meta$: Observable<PaginationMeta | null>;

  abstract loadTransfers(params: CarTransferQueryParams): void;
  abstract refresh(): void;
}
