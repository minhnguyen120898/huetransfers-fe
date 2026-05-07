import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  NonNullableFormBuilder,
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { select, Store } from '@ngxs/store';
import { AuthState } from '@features/auth/store/auth.state';
import { AuthActions } from '@features/auth/store/auth.actions';
import { FormValidatorsService } from '@shared/services/form-validators.service';

interface ForceChangePasswordForm {
  currentPassword: FormControl<string>;
  newPassword: FormControl<string>;
  confirmPassword: FormControl<string>;
}

@Component({
  selector: 'app-force-change-password',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './force-change-password.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForceChangePassword {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly store = inject(Store);

  readonly loading = select(AuthState.loading);
  readonly error = select(AuthState.error);

  readonly form: FormGroup<ForceChangePasswordForm> = this.fb.group(
    {
      currentPassword: this.fb.control('', [Validators.required]),
      newPassword: this.fb.control('', [
        Validators.required,
        Validators.minLength(6),
        FormValidatorsService.noWhitespace(),
      ]),
      confirmPassword: this.fb.control('', [Validators.required]),
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

  get passwordsDoNotMatch(): boolean {
    const confirmPasswordControl = this.form.controls.confirmPassword;
    const newPasswordControl = this.form.controls.newPassword;
    return (
      this.form.hasError('passwordsDoNotMatch') &&
      (confirmPasswordControl?.touched || newPasswordControl?.touched)
    );
  }

  getErrorMessage(fieldName: keyof ForceChangePasswordForm): string {
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
    const isLoading = this.store.selectSnapshot(AuthState.loading);
    if (isLoading) {
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.form.getRawValue();
    this.store.dispatch(
      new AuthActions.ForceChangePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      }),
    );
  }
}
