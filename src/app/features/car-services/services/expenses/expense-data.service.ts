import { Observable } from 'rxjs';
import {
  CreateExpenseDto,
  Expense,
  ExpenseQueryParams,
  UpdateExpenseDto,
} from '@core/models/car-booking.model';
import { PaginationMeta } from '@core/models/api.model';

export abstract class ExpenseDataService {
  abstract readonly expenses$: Observable<Expense[]>;
  abstract readonly loading$: Observable<boolean>;
  abstract readonly error$: Observable<string | null>;
  abstract readonly meta$: Observable<PaginationMeta | null>;

  abstract loadExpenses(params?: ExpenseQueryParams): void;
  abstract refresh(): void;
  abstract createExpense(dto: CreateExpenseDto): void;
  abstract updateExpense(id: string, dto: UpdateExpenseDto): void;
  abstract deleteExpense(id: string): void;
}
