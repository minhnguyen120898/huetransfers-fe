import { TemplateRef } from '@angular/core';
import { TableColumn } from '@shared/components/data-table/models/table-column.model';
import { TravelAgency } from '@core/models/partner.model';
import { AgencyColumnKey } from '../models/agency.enums';

/**
 * Get agency table column definitions
 * Accepts optional template for custom toggle column
 *
 * @param toggleTemplate Optional template for status toggle column
 * @returns Array of table column definitions
 */
export function getAgencyTableColumns(
  toggleTemplate?: TemplateRef<any>,
): TableColumn<TravelAgency>[] {
  return [
    {
      key: AgencyColumnKey.Name,
      header: 'Name',
      accessor: (row) => row.name,
      type: 'text',
      sortable: true,
    },
    {
      key: AgencyColumnKey.Tel,
      header: 'Phone',
      accessor: (row) => row.tel,
      type: 'text',
    },
    {
      key: AgencyColumnKey.Address,
      header: 'Address',
      accessor: (row) => row.address,
      type: 'text',
    },
    {
      key: AgencyColumnKey.Note,
      header: 'Note',
      accessor: (row) => row.note,
      type: 'text',
    },
    {
      key: AgencyColumnKey.IsActive,
      header: 'Active',
      accessor: (row) => row.isActive,
      type: toggleTemplate ? 'custom' : 'badge',
      align: 'center',
      width: '120px',
      // Use custom template if provided, otherwise use badge
      ...(toggleTemplate
        ? { cellTemplate: toggleTemplate }
        : {
            badgeConfig: {
              colorMap: {
                true: 'blue-chip',
                false: 'bg-gray-100 text-gray-800',
              },
              labelMap: {
                true: 'Active',
                false: 'Inactive',
              },
            },
          }),
    },
  ];
}
