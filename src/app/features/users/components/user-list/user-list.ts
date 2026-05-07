import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { NonNullableFormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngxs/store';
import { AuthState } from '@features/auth';
import { User, UserRole } from '@core/models';
import { DataTable } from '@shared/components/data-table/data-table';
import { SearchBar } from '@shared/components/search-bar/search-bar';
import { TableCard } from '@shared/components/table-card/table-card';
import { ConfirmDialog, ConfirmDialogData } from '@shared/components/confirm-dialog/confirm-dialog';
import { TableColumn } from '@shared/components/data-table/models/table-column.model';
import { TableAction } from '@shared/components/data-table/models/table-action.model';
import { MEDIUM_DIALOG, SMALL_DIALOG } from '@core/config/dialog.config';
import { UserTableDataSource } from '../../services/user-table-datasource';
import { UserDataService } from '../../services/user-data.service';
import { NgxsUserDataService } from '../../services/ngxs-user-data.service';
import { UserFormDialog, UserFormDialogData } from '../user-form-dialog/user-form-dialog';
import { getUserTableColumns } from '../../configs/user-table-columns.config';
import {
  createUserTableActions,
  UserActionHandlers,
} from '../../configs/user-table-actions.config';
import { CreateUserDto, UpdateUserDto } from '../../models/user-management.model';

interface UserFiltersForm {
  search: FormControl<string>;
  role: FormControl<UserRole | 'all'>;
  isActive: FormControl<boolean | 'all'>;
}

@Component({
  selector: 'app-user-list',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    DataTable,
    SearchBar,
    TableCard,
  ],
  providers: [UserTableDataSource, { provide: UserDataService, useClass: NgxsUserDataService }],
  templateUrl: './user-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent implements OnInit, UserActionHandlers {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly store = inject(Store);
  private readonly destroyRef = inject(DestroyRef);

  readonly dataSource = inject(UserTableDataSource);
  readonly UserRole = UserRole;
  readonly currentUserId = this.store.selectSnapshot(AuthState.user)?.id ?? '';

  readonly filtersForm = this.fb.group<UserFiltersForm>({
    search: this.fb.control(''),
    role: this.fb.control<UserRole | 'all'>('all'),
    isActive: this.fb.control<boolean | 'all'>('all'),
  });

  columns: TableColumn<User>[] = [];
  actions: TableAction<User>[] = [];

  ngOnInit(): void {
    this.columns = getUserTableColumns();
    this.actions = createUserTableActions(this, this.currentUserId);
    this.dataSource.loadData();
    this.setupFilters();
  }

  private setupFilters(): void {
    this.filtersForm.controls.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((search) => {
        this.dataSource.setFilter('search', search || undefined);
      });

    this.filtersForm.controls.role.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((role) => {
        this.dataSource.setFilter('role', role === 'all' ? undefined : role);
      });

    this.filtersForm.controls.isActive.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((isActive) => {
        this.dataSource.setFilter('isActive', isActive === 'all' ? undefined : isActive);
      });
  }

  onSearchChange(search: string): void {
    this.filtersForm.controls.search.setValue(search);
  }

  openCreateDialog(): void {
    const ref = this.dialog.open<UserFormDialog, UserFormDialogData, CreateUserDto | null>(
      UserFormDialog,
      MEDIUM_DIALOG,
    );
    ref.afterClosed().subscribe((result) => {
      if (result) this.dataSource.createUser(result);
    });
  }

  onEdit(user: User): void {
    const ref = this.dialog.open<UserFormDialog, UserFormDialogData, UpdateUserDto | null>(
      UserFormDialog,
      { ...MEDIUM_DIALOG, data: { user } },
    );
    ref.afterClosed().subscribe((result) => {
      if (result) this.dataSource.updateUser(user.id, result);
    });
  }

  onDeactivate(user: User): void {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      ...SMALL_DIALOG,
      data: {
        title: 'Deactivate User',
        message: `Deactivate "${user.fullName}"? They will lose access immediately.`,
        confirmText: 'Deactivate',
        cancelText: 'Cancel',
        confirmColor: 'warn',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) this.dataSource.deactivateUser(user.id);
    });
  }

  onReactivate(user: User): void {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      ...SMALL_DIALOG,
      data: {
        title: 'Reactivate User',
        message: `Reactivate "${user.fullName}"?`,
        confirmText: 'Reactivate',
        cancelText: 'Cancel',
        confirmColor: 'primary',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) this.dataSource.reactivateUser(user.id);
    });
  }
}
