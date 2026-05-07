import { TableAction } from '@shared/components/data-table/models/table-action.model';
import { TravelAgency } from '@core/models/partner.model';
import { AgencyActionId } from '../models/agency.enums';

/**
 * Action handler interface
 * Component must implement these methods
 */
export interface AgencyActionHandlers {
  onEdit: (agency: TravelAgency) => void;
  onDelete: (agency: TravelAgency) => void;
}

/**
 * Create agency table action configuration
 * Factory pattern allows dependency injection of handlers
 *
 * Note: Toggle status (activate/deactivate) is handled by the Material slide toggle column
 * - Deactivating uses DELETE API (soft delete)
 * - Activating uses PUT API to update isActive = true
 *
 * @param handlers Object containing action handler methods
 * @returns Array of table action definitions
 */
export function createAgencyTableActions(
  handlers: AgencyActionHandlers,
): TableAction<TravelAgency>[] {
  return [
    {
      id: AgencyActionId.Edit,
      icon: 'edit',
      tooltip: 'Edit',
      color: 'primary',
      handler: (agency) => handlers.onEdit(agency),
    },
    {
      id: AgencyActionId.Delete,
      icon: 'delete',
      tooltip: 'Delete',
      color: 'primary',
      handler: (guide) => handlers.onDelete(guide),
    },
  ];
}
