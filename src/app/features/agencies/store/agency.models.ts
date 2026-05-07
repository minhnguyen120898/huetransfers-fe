import { TravelAgency } from '@core/models/partner.model';
import { PaginationMeta } from '@core/models/api.model';

export interface AgencyStateModel {
  agencies: TravelAgency[];
  selectedAgency: TravelAgency | null;
  loading: boolean;
  error: string | null;
  meta: PaginationMeta | null;
}

export const agencyStateDefaults: AgencyStateModel = {
  agencies: [],
  selectedAgency: null,
  loading: false,
  error: null,
  meta: null,
};
