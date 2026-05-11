import { PaginationMeta } from '@core/models/api.model';
import { CarTransferDetail, CarTransferQueryParams } from '../../models/profit';

export interface CarTransferStateModel {
  transfers: CarTransferDetail[];
  meta: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  lastQueryParams: CarTransferQueryParams | null;
}

export const carTransferStateDefaults: CarTransferStateModel = {
  transfers: [],
  meta: null,
  loading: false,
  error: null,
  lastQueryParams: null,
};
