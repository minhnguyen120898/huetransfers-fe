import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ChangePasswordForm } from '../../models/change-password.model';
import { SettingsActions } from '../../store/settings.actions';
import { FormValidatorsService } from '@shared/services/form-validators.service';
import { SettingsState } from '../../store/settings.state';
import { AsyncPipe } from '@angular/common';

/**
 * Change Password
 * Allows users to change their password
 */
@Component({
  selector: 'app-change-password',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    AsyncPipe,
  ],
  templateUrl: './change-password.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePassword {
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  readonly loading$ = this.store.select(SettingsState.changePasswordLoading);

  readonly form = this.fb.group<ChangePasswordForm>(
    {
      currentPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      newPassword: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(6),
          FormValidatorsService.noWhitespace(),
        ],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    {
      validators: [FormValidatorsService.passwordsMatch('newPassword', 'confirmPassword')],
    },
  );

  readonly fieldErrors: Record<string, Record<string, string>> = {
    currentPassword: {
      required: 'Current password is required',
    },
    newPassword: {
      required: 'New password is required',
      minlength: 'Password must be at least 6 characters',
      noWhitespace: 'Password cannot contain whitespace',
    },
    confirmPassword: {
      required: 'Confirm password is required',
    },
  };

  constructor() {
    // Reset form on successful password change
    this.actions$
      .pipe(
        ofActionSuccessful(SettingsActions.ChangePasswordSuccess),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.form.reset();
      });
  }

  get passwordsDoNotMatch(): boolean {
    const confirmPasswordControl = this.form.controls.confirmPassword;
    const newPasswordControl = this.form.controls.newPassword;
    return (
      this.form.hasError('passwordsDoNotMatch') &&
      (confirmPasswordControl?.touched || newPasswordControl?.touched)
    );
  }

  getErrorMessage(fieldName: keyof ChangePasswordForm): string {
    const control = this.form.get(fieldName);
    if (control && control.touched && control.errors) {
      for (const errorKey of Object.keys(control.errors)) {
        const fieldErrorMap = this.fieldErrors[fieldName];
        if (fieldErrorMap && fieldErrorMap[errorKey]) {
          return fieldErrorMap[errorKey];
        }
      }
    }
    return '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Prevent submission if already loading
    const isLoading = this.store.selectSnapshot(SettingsState.changePasswordLoading);
    if (isLoading) {
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.form.getRawValue();
    this.store.dispatch(
      new SettingsActions.ChangePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      }),
    );
  }
}
