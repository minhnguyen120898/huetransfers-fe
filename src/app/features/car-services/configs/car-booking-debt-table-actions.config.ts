import { TableAction } from '@shared/components/data-table/models/table-action.model';
import { CarBookingDebtAgencyRow } from '@core/models/car-booking.model';

export enum CarBookingDebtActionId {
  View = 'view',
}

export interface CarBookingDebtActionHandlers {
  onView: (row: CarBookingDebtAgencyRow) => void;
}

export function createCarBookingDebtTableActions(
  handlers: CarBookingDebtActionHandlers,
): TableAction<CarBookingDebtAgencyRow>[] {
  return [
    {
      id: CarBookingDebtActionId.View,
      icon: 'visibility',
      tooltip: 'View Details',
      color: 'primary',
      handler: (row) => handlers.onView(row),
    },
  ];
}
