import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '@core/services/base-http.service';
import { User } from '@core/models';
import { PaginatedResponse } from '@core/models/api.model';
import { CreateUserDto, UpdateUserDto, UserQueryParams } from '../models/user-management.model';

@Injectable({ providedIn: 'root' })
export class UserManagementService extends BaseHttpService {
  getUsers(params?: UserQueryParams): Observable<PaginatedResponse<User>> {
    const httpParams = params ? this.buildParams(params as Record<string, unknown>) : undefined;
    return this.get<PaginatedResponse<User>>('user', { params: httpParams });
  }

  createUser(payload: CreateUserDto): Observable<User> {
    return this.post<User>('user', payload);
  }

  updateUser(id: string, payload: UpdateUserDto): Observable<User> {
    return this.put<User>(`user/${id}`, payload);
  }

  deactivateUser(id: string): Observable<void> {
    return this.delete<void>(`user/${id}`);
  }
}
