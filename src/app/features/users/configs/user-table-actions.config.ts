import { TableAction } from '@shared/components/data-table/models/table-action.model';
import { User, UserRole } from '@core/models';

export interface UserActionHandlers {
  onEdit(user: User): void;
  onDeactivate(user: User): void;
  onReactivate(user: User): void;
}

export function createUserTableActions(
  handlers: UserActionHandlers,
  currentUserId: string,
): TableAction<User>[] {
  return [
    {
      id: 'edit',
      icon: 'edit',
      color: 'primary',
      disabled: (user) => user.role === UserRole.ADMIN && user.id !== currentUserId,
      tooltip: (user) =>
        user.role === UserRole.ADMIN && user.id !== currentUserId
          ? 'Cannot modify other admin accounts'
          : 'Edit user',
      handler: (user) => handlers.onEdit(user),
    },
    {
      id: 'deactivate',
      icon: 'person_off',
      color: 'warn',
      visible: (user) => user.isActive,
      disabled: (user) =>
        user.id === currentUserId || (user.role === UserRole.ADMIN && user.id !== currentUserId),
      tooltip: (user) => {
        if (user.id === currentUserId) return 'Cannot deactivate your own account';
        if (user.role === UserRole.ADMIN && user.id !== currentUserId)
          return 'Cannot modify other admin accounts';
        return 'Deactivate user';
      },
      handler: (user) => handlers.onDeactivate(user),
    },
    {
      id: 'reactivate',
      icon: 'person',
      color: 'primary',
      visible: (user) => !user.isActive,
      disabled: (user) => user.role === UserRole.ADMIN && user.id !== currentUserId,
      tooltip: (user) =>
        user.role === UserRole.ADMIN && user.id !== currentUserId
          ? 'Cannot modify other admin accounts'
          : 'Reactivate user',
      handler: (user) => handlers.onReactivate(user),
    },
  ];
}
