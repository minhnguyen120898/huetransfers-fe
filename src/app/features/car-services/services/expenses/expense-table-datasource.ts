import { inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractTableDataSource } from '@shared/components/data-table/models';
import {
  CreateExpenseDto,
  Expense,
  ExpenseCategory,
  ExpenseQueryParams,
  UpdateExpenseDto,
} from '@core/models/car-booking.model';
import { ExpenseDataService } from './expense-data.service';
import { ExpenseCategoryFilter } from '../../models/expenses/expense.enums';

export interface ExpenseTableFilters {
  search?: string;
  category?: ExpenseCategoryFilter;
  year?: number;
  month?: number;
}

@Injectable()
export class ExpenseTableDataSource extends AbstractTableDataSource<Expense> {
  private readonly dataService = inject(ExpenseDataService);

  constructor() {
    super();
    this.connectToDataService();
  }

  private connectToDataService(): void {
    this.dataService.expenses$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((expenses) => this._data.set(expenses));

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

  override loadData(page = 1, pageSize = 50): void {
    const filters = this.filters() as ExpenseTableFilters;
    const params: ExpenseQueryParams = { page, limit: pageSize };

    if (filters.search) params.search = filters.search;
    if (filters.category) {
      params.category = filters.category as unknown as ExpenseCategory;
    }
    if (filters.year) params.year = filters.year;
    if (filters.month) params.month = filters.month;

    this.dataService.loadExpenses(params);
  }

  override refresh(): void {
    this.dataService.refresh();
  }

  createExpense(dto: CreateExpenseDto): void {
    this.dataService.createExpense(dto);
  }

  updateExpense(id: string, dto: UpdateExpenseDto): void {
    this.dataService.updateExpense(id, dto);
  }

  deleteExpense(id: string): void {
    this.dataService.deleteExpense(id);
  }

  protected override areRowsEqual(row1: Expense, row2: Expense): boolean {
    return row1.id === row2.id;
  }
}
