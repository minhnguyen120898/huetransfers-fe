import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ExpenseService } from '../../services/expenses/expense.service';
import { ExpenseActions } from './expense.actions';
import { ExpenseStateModel, expenseStateDefaults } from './expense.models';
import { Expense, ExpenseSummary } from '@core/models/car-booking.model';
import { PaginationMeta } from '@core/models/api.model';
import { NotificationService } from '@core/services/notification.service';

@State<ExpenseStateModel>({
  name: 'expense',
  defaults: expenseStateDefaults,
})
@Injectable()
export class ExpenseState {
  private readonly expenseService = inject(ExpenseService);
  private readonly notification = inject(NotificationService);

  @Selector()
  static expenses(state: ExpenseStateModel): Expense[] {
    return state.expenses;
  }

  @Selector()
  static summary(state: ExpenseStateModel): ExpenseSummary | null {
    return state.summary;
  }

  @Selector()
  static loading(state: ExpenseStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static summaryLoading(state: ExpenseStateModel): boolean {
    return state.summaryLoading;
  }

  @Selector()
  static error(state: ExpenseStateModel): string | null {
    return state.error;
  }

  @Selector()
  static meta(state: ExpenseStateModel): PaginationMeta | null {
    return state.meta;
  }

  @Selector()
  static lastQueryParams(state: ExpenseStateModel) {
    return state.lastQueryParams;
  }

  private refresh(ctx: StateContext<ExpenseStateModel>): void {
    const state = ctx.getState();
    if (state.lastQueryParams) {
      ctx.dispatch(new ExpenseActions.LoadExpenses(state.lastQueryParams));
    }
    if (state.summary) {
      ctx.dispatch(new ExpenseActions.LoadExpenseSummary(state.summary.year, state.summary.month));
    }
  }

  @Action(ExpenseActions.LoadExpenses)
  loadExpenses(ctx: StateContext<ExpenseStateModel>, action: ExpenseActions.LoadExpenses) {
    ctx.patchState({ loading: true, error: null, lastQueryParams: action.params });
    return this.expenseService.getExpenses(action.params).pipe(
      tap((response) => {
        ctx.dispatch(new ExpenseActions.LoadExpensesSuccess(response.data, response.meta));
      }),
      catchError((error) => {
        ctx.dispatch(
          new ExpenseActions.LoadExpensesFailure(error.message || 'Failed to load expenses'),
        );
        return of(error);
      }),
    );
  }

  @Action(ExpenseActions.LoadExpensesSuccess)
  loadExpensesSuccess(
    ctx: StateContext<ExpenseStateModel>,
    action: ExpenseActions.LoadExpensesSuccess,
  ) {
    ctx.patchState({ expenses: action.expenses, meta: action.meta, loading: false, error: null });
  }

  @Action(ExpenseActions.LoadExpensesFailure)
  loadExpensesFailure(
    ctx: StateContext<ExpenseStateModel>,
    action: ExpenseActions.LoadExpensesFailure,
  ) {
    ctx.patchState({ loading: false, error: action.error });
    this.notification.showError('Failed to load expenses');
  }

  @Action(ExpenseActions.LoadExpenseSummary)
  loadExpenseSummary(
    ctx: StateContext<ExpenseStateModel>,
    action: ExpenseActions.LoadExpenseSummary,
  ) {
    ctx.patchState({ summaryLoading: true });
    return this.expenseService.getExpenseSummary(action.year, action.month).pipe(
      tap((summary) => {
        ctx.dispatch(new ExpenseActions.LoadExpenseSummarySuccess(summary));
      }),
      catchError((error) => {
        ctx.dispatch(
          new ExpenseActions.LoadExpenseSummaryFailure(
            error.message || 'Failed to load expense summary',
          ),
        );
        return of(error);
      }),
    );
  }

  @Action(ExpenseActions.LoadExpenseSummarySuccess)
  loadExpenseSummarySuccess(
    ctx: StateContext<ExpenseStateModel>,
    action: ExpenseActions.LoadExpenseSummarySuccess,
  ) {
    ctx.patchState({ summary: action.summary, summaryLoading: false });
  }

  @Action(ExpenseActions.LoadExpenseSummaryFailure)
  loadExpenseSummaryFailure(ctx: StateContext<ExpenseStateModel>) {
    ctx.patchState({ summaryLoading: false });
  }

  @Action(ExpenseActions.CreateExpense)
  createExpense(ctx: StateContext<ExpenseStateModel>, action: ExpenseActions.CreateExpense) {
    ctx.patchState({ loading: true, error: null });
    return this.expenseService.createExpense(action.dto).pipe(
      tap((expense) => {
        ctx.dispatch(new ExpenseActions.CreateExpenseSuccess(expense));
      }),
      catchError((error) => {
        ctx.dispatch(
          new ExpenseActions.CreateExpenseFailure(error.message || 'Failed to create expense'),
        );
        return of(error);
      }),
    );
  }

  @Action(ExpenseActions.CreateExpenseSuccess)
  createExpenseSuccess(ctx: StateContext<ExpenseStateModel>) {
    ctx.patchState({ loading: false, error: null });
    this.notification.showSuccess('Expense created successfully');
    this.refresh(ctx);
  }

  @Action(ExpenseActions.CreateExpenseFailure)
  createExpenseFailure(
    ctx: StateContext<ExpenseStateModel>,
    action: ExpenseActions.CreateExpenseFailure,
  ) {
    ctx.patchState({ loading: false, error: action.error });
    this.notification.showError('Failed to create expense');
  }

  @Action(ExpenseActions.UpdateExpense)
  updateExpense(ctx: StateContext<ExpenseStateModel>, action: ExpenseActions.UpdateExpense) {
    ctx.patchState({ loading: true, error: null });
    return this.expenseService.updateExpense(action.id, action.dto).pipe(
      tap((expense) => {
        ctx.dispatch(new ExpenseActions.UpdateExpenseSuccess(expense));
      }),
      catchError((error) => {
        ctx.dispatch(
          new ExpenseActions.UpdateExpenseFailure(error.message || 'Failed to update expense'),
        );
        return of(error);
      }),
    );
  }

  @Action(ExpenseActions.UpdateExpenseSuccess)
  updateExpenseSuccess(
    ctx: StateContext<ExpenseStateModel>,
    action: ExpenseActions.UpdateExpenseSuccess,
  ) {
    const state = ctx.getState();
    const expenses = state.expenses.map((e) => (e.id === action.expense.id ? action.expense : e));
    ctx.patchState({ expenses, loading: false, error: null });
    this.notification.showSuccess('Expense updated successfully');
    this.refresh(ctx);
  }

  @Action(ExpenseActions.UpdateExpenseFailure)
  updateExpenseFailure(
    ctx: StateContext<ExpenseStateModel>,
    action: ExpenseActions.UpdateExpenseFailure,
  ) {
    ctx.patchState({ loading: false, error: action.error });
    this.notification.showError('Failed to update expense');
  }

  @Action(ExpenseActions.DeleteExpense)
  deleteExpense(ctx: StateContext<ExpenseStateModel>, action: ExpenseActions.DeleteExpense) {
    ctx.patchState({ loading: true, error: null });
    return this.expenseService.deleteExpense(action.id).pipe(
      tap(() => {
        ctx.dispatch(new ExpenseActions.DeleteExpenseSuccess(action.id));
      }),
      catchError((error) => {
        ctx.dispatch(
          new ExpenseActions.DeleteExpenseFailure(error.message || 'Failed to delete expense'),
        );
        return of(error);
      }),
    );
  }

  @Action(ExpenseActions.DeleteExpenseSuccess)
  deleteExpenseSuccess(
    ctx: StateContext<ExpenseStateModel>,
    action: ExpenseActions.DeleteExpenseSuccess,
  ) {
    const expenses = ctx.getState().expenses.filter((e) => e.id !== action.id);
    ctx.patchState({ expenses, loading: false, error: null });
    this.notification.showSuccess('Expense deleted successfully');
    this.refresh(ctx);
  }

  @Action(ExpenseActions.DeleteExpenseFailure)
  deleteExpenseFailure(
    ctx: StateContext<ExpenseStateModel>,
    action: ExpenseActions.DeleteExpenseFailure,
  ) {
    ctx.patchState({ loading: false, error: action.error });
    this.notification.showError('Failed to delete expense');
  }

  @Action(ExpenseActions.SelectExpense)
  selectExpense(ctx: StateContext<ExpenseStateModel>, action: ExpenseActions.SelectExpense) {
    ctx.patchState({ selectedExpense: action.expense });
  }
}
