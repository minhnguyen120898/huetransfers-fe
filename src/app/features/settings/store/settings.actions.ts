import { ChangePasswordDto, CreateUserDto, UpdateUserDto } from './settings.models';

/**
 * Settings Actions
 */
export namespace SettingsActions {
  /**
   * Change password action
   */
  export class ChangePassword {
    static readonly type = '[Settings] Change Password';
    constructor(public payload: ChangePasswordDto) {}
  }

  /**
   * Change password success
   */
  export class ChangePasswordSuccess {
    static readonly type = '[Settings] Change Password Success';
  }

  /**
   * Change password failure
   */
  export class ChangePasswordFailure {
    static readonly type = '[Settings] Change Password Failure';
    constructor(public error: string) {}
  }

  /**
   * Create user action
   */
  export class CreateUser {
    static readonly type = '[Settings] Create User';
    constructor(public payload: CreateUserDto) {}
  }

  /**
   * Create user success
   */
  export class CreateUserSuccess {
    static readonly type = '[Settings] Create User Success';
  }

  /**
   * Create user failure
   */
  export class CreateUserFailure {
    static readonly type = '[Settings] Create User Failure';
    constructor(public error: string) {}
  }

  /**
   * Clear error
   */
  export class ClearError {
    static readonly type = '[Settings] Clear Error';
  }

  export class UpdateInformation {
    static readonly type = '[Settings] Update User Information';
    constructor(
      public id: string,
      public payload: UpdateUserDto,
    ) {}
  }

  export class UpdateInformationSuccess {
    static readonly type = '[Settings] Update User Success';
  }

  export class UpdateInformationFailure {
    static readonly type = '[Settings] Update User Failure';
    constructor(public error: string) {}
  }
}
