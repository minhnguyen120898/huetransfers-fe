import { Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractTableDataSource } from '@shared/components/data-table/models';
import { User, UserRole } from '@core/models';
import { UserDataService } from './user-data.service';
import { CreateUserDto, UpdateUserDto } from '../models/user-management.model';

export interface UserTableFilters {
  search?: string;
  role?: UserRole | 'all';
  isActive?: boolean | 'all';
}

@Injectable()
export class UserTableDataSource extends AbstractTableDataSource<User> {
  private readonly dataService = inject(UserDataService);

  constructor() {
    super();
    this.dataService.users$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((users) => this._data.set(users));

    this.dataService.loading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loading) => this._loading.set(loading));

    this.dataService.error$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((error) => this._error.set(error));

    this.dataService.meta$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((meta) => this._meta.set(meta));
  }

  override loadData(page = 1, pageSize = 10): void {
    const filters = this.filters() as UserTableFilters;
    const params: Record<string, unknown> = { page, limit: pageSize };

    if (filters.search) params['search'] = filters.search;
    if (filters.role && filters.role !== 'all') params['role'] = filters.role;
    if (filters.isActive !== undefined && filters.isActive !== 'all') {
      params['isActive'] = filters.isActive;
    }

    this.dataService.loadUsers(params);
  }

  override refresh(): void {
    this.dataService.refresh();
  }

  createUser(payload: CreateUserDto): void {
    this.dataService.createUser(payload);
  }

  updateUser(id: string, payload: UpdateUserDto): void {
    this.dataService.updateUser(id, payload);
  }

  deactivateUser(id: string): void {
    this.dataService.deactivateUser(id);
  }

  reactivateUser(id: string): void {
    this.dataService.reactivateUser(id);
  }

  protected override areRowsEqual(row1: User, row2: User): boolean {
    return row1.id === row2.id;
  }
}
