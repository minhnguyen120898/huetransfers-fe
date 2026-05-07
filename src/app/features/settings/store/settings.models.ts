/**
 * Settings State Model
 */
export interface SettingsStateModel {
  changePasswordLoading: boolean;
  createUserLoading: boolean;
  error: string | null;
  updateUserLoading: boolean;
  updateUserError: string | null;
}

/**
 * Change Password DTO
 */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Create User DTO
 */
export interface CreateUserDto {
  email: string;
  fullName: string;
  role: string;
}

export interface UpdateUserDto {
  fullName: string;
  tel: string;
}
