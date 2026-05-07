import { Expense, ExpenseQueryParams, ExpenseSummary } from '@core/models/car-booking.model';
import { PaginationMeta } from '@core/models/api.model';

export interface ExpenseStateModel {
  expenses: Expense[];
  summary: ExpenseSummary | null;
  selectedExpense: Expense | null;
  loading: boolean;
  summaryLoading: boolean;
  error: string | null;
  meta: PaginationMeta | null;
  lastQueryParams: ExpenseQueryParams | null;
}

export const expenseStateDefaults: ExpenseStateModel = {
  expenses: [],
  summary: null,
  selectedExpense: null,
  loading: false,
  summaryLoading: false,
  error: null,
  meta: null,
  lastQueryParams: null,
};
