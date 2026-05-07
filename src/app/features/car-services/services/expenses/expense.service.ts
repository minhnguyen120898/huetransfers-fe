import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '@core/services/base-http.service';
import { PaginatedResponse } from '@core/models/api.model';
import {
  CreateExpenseDto,
  Expense,
  ExpenseQueryParams,
  ExpenseSummary,
  UpdateExpenseDto,
} from '@core/models/car-booking.model';

@Injectable({ providedIn: 'root' })
export class ExpenseService extends BaseHttpService {
  private readonly endpoint = 'expenses';

  getExpenses(params?: ExpenseQueryParams): Observable<PaginatedResponse<Expense>> {
    const httpParams = this.buildParams((params || {}) as Record<string, unknown>);
    return this.get<PaginatedResponse<Expense>>(this.endpoint, { params: httpParams });
  }

  getExpenseSummary(year: number, month: number): Observable<ExpenseSummary> {
    const httpParams = this.buildParams({ year, month });
    return this.get<ExpenseSummary>(`${this.endpoint}/summary`, { params: httpParams });
  }

  getExpenseById(id: string): Observable<Expense> {
    return this.get<Expense>(`${this.endpoint}/${id}`);
  }

  createExpense(dto: CreateExpenseDto): Observable<Expense> {
    return this.post<Expense>(this.endpoint, dto);
  }

  updateExpense(id: string, dto: UpdateExpenseDto): Observable<Expense> {
    return this.patch<Expense>(`${this.endpoint}/${id}`, dto);
  }

  deleteExpense(id: string): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}
