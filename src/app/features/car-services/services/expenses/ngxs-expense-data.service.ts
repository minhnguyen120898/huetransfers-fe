import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';
import { ExpenseDataService } from './expense-data.service';
import {
  CreateExpenseDto,
  Expense,
  ExpenseQueryParams,
  UpdateExpenseDto,
} from '@core/models/car-booking.model';
import { PaginationMeta } from '@core/models/api.model';
import { ExpenseState } from '../../store/expenses/expense.state';
import { ExpenseActions } from '../../store/expenses/expense.actions';

@Injectable()
export class NgxsExpenseDataService extends ExpenseDataService {
  private readonly store = inject(Store);

  readonly expenses$: Observable<Expense[]> = this.store.select(ExpenseState.expenses);
  readonly loading$: Observable<boolean> = this.store.select(ExpenseState.loading);
  readonly error$: Observable<string | null> = this.store.select(ExpenseState.error);
  readonly meta$: Observable<PaginationMeta | null> = this.store.select(ExpenseState.meta);

  loadExpenses(params?: ExpenseQueryParams): void {
    this.store.dispatch(new ExpenseActions.LoadExpenses(params));
  }

  refresh(): void {
    const lastParams = this.store.selectSnapshot(ExpenseState.lastQueryParams);
    this.store.dispatch(new ExpenseActions.LoadExpenses({ ...lastParams, page: 1 }));
  }

  createExpense(dto: CreateExpenseDto): void {
    this.store.dispatch(new ExpenseActions.CreateExpense(dto));
  }

  updateExpense(id: string, dto: UpdateExpenseDto): void {
    this.store.dispatch(new ExpenseActions.UpdateExpense(id, dto));
  }

  deleteExpense(id: string): void {
    this.store.dispatch(new ExpenseActions.DeleteExpense(id));
  }
}
