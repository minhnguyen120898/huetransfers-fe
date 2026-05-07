import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '@core/services/base-http.service';
import { ChangePasswordDto, CreateUserDto, UpdateUserDto } from '../store/settings.models';
import { User } from '@core/models';

/**
 * Settings Service
 * Handles HTTP requests for settings-related operations
 */
@Injectable({ providedIn: 'root' })
export class SettingsService extends BaseHttpService {
  /**
   * Change user password
   * POST /auth/change-password
   */
  changePassword(payload: ChangePasswordDto): Observable<{ message: string }> {
    return this.post<{ message: string }>('auth/change-password', payload);
  }

  /**
   * Create new user
   * POST /user
   */
  createUser(payload: CreateUserDto): Observable<User> {
    return this.post<User>('user', payload);
  }

  /**
   * Update user information
   * PUT /user/:id
   */
  updateUser(id: string, payload: UpdateUserDto): Observable<User> {
    return this.put<User>(`user/${id}`, payload);
  }
}
