import { CreateTravelAgencyDto, UpdateTravelAgencyDto } from '@core/models/partner.model';
import { AgencyQueryParams } from '../services/agency.service';

export namespace AgencyActions {
  export class LoadAgencies {
    static readonly type = '[Agency] Load Agencies';
    constructor(public params?: AgencyQueryParams) {}
  }

  export class LoadAgencyById {
    static readonly type = '[Agency] Load Agency By ID';
    constructor(public id: string) {}
  }

  export class CreateAgency {
    static readonly type = '[Agency] Create Agency';
    constructor(public data: CreateTravelAgencyDto) {}
  }

  export class UpdateAgency {
    static readonly type = '[Agency] Update Agency';
    constructor(
      public id: string,
      public data: UpdateTravelAgencyDto,
    ) {}
  }

  export class DeleteAgency {
    static readonly type = '[Agency] Delete Agency';
    constructor(public id: string) {}
  }

  export class ToggleAgencyActiveStatus {
    static readonly type = '[Agency] Toggle Active Status';
    constructor(
      public id: string,
      public isActive: boolean,
    ) {}
  }

  export class SelectAgency {
    static readonly type = '[Agency] Select Agency';
    constructor(public agency: TravelAgency | null) {}
  }

  export class ClearAgencyError {
    static readonly type = '[Agency] Clear Error';
  }
}

// Import here to avoid circular dependency
import { TravelAgency } from '@core/models/partner.model';
