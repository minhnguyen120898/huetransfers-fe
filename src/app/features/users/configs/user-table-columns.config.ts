import { TableColumn } from '@shared/components/data-table/models/table-column.model';
import { User } from '@core/models';
import { formatDate, DateFormat } from '@core/config/date.config';

export function getUserTableColumns(): TableColumn<User>[] {
  return [
    {
      key: 'fullName',
      header: 'Full Name',
      sortable: false,
    },
    {
      key: 'email',
      header: 'Email',
      sortable: false,
    },
    {
      key: 'role',
      header: 'Role',
      sortable: false,
      accessor: (user) => user.role,
    },
    {
      key: 'isActive',
      header: 'Status',
      sortable: false,
      accessor: (user) => (user.isActive ? 'Active' : 'Inactive'),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: false,
      accessor: (user) => formatDate(user.createdAt, DateFormat.SHORT_DATE),
    },
  ];
}
