import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Form Validators Service
 * Custom validators for reactive forms
 */
@Injectable({
  providedIn: 'root',
})
export class FormValidatorsService {
  /**
   * Validator to check if two password fields match
   * @param passwordField - Name of the password field
   * @param confirmPasswordField - Name of the confirm password field
   * @returns ValidatorFn
   */
  static passwordsMatch(passwordField: string, confirmPasswordField: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const password = group.get(passwordField)?.value;
      const confirmPassword = group.get(confirmPasswordField)?.value;

      if (!password || !confirmPassword) {
        return null;
      }

      return password === confirmPassword ? null : { passwordsDoNotMatch: true };
    };
  }

  /**
   * Validator to check if a field contains whitespace
   * @returns ValidatorFn
   */
  static noWhitespace(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      return /\s/.test(value) ? { noWhitespace: true } : null;
    };
  }

  /**
   * Password strength validator
   * Must contain: 1 uppercase, 1 lowercase, 1 number, 1 special char (@$!%*?&#)
   * Minimum 8 characters
   * @returns ValidatorFn
   */
  static passwordStrength(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /\d/.test(value);
      const hasSpecialChar = /[@$!%*?&#]/.test(value);
      const minLength = value.length >= 8;

      const isValid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && minLength;

      return isValid
        ? null
        : {
            passwordStrength: {
              hasUpperCase,
              hasLowerCase,
              hasNumber,
              hasSpecialChar,
              minLength,
            },
          };
    };
  }
}
