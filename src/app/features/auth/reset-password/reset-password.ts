import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngxs/store';
import { AuthActions } from '../store/auth.actions';
import { AuthState } from '../store/auth.state';
import { FormValidatorsService } from '@shared/services/form-validators.service';
import { NotificationService } from '@core/services/notification.service';

interface ResetPasswordForm {
  newPassword: FormControl<string>;
  confirmPassword: FormControl<string>;
}

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.html',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPassword implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  readonly loading = this.store.selectSignal(AuthState.loading);
  readonly hidePassword = signal(true);
  readonly hideConfirmPassword = signal(true);

  private token = '';

  readonly resetPasswordForm: FormGroup<ResetPasswordForm> = this.fb.group(
    {
      newPassword: this.fb.control('', [
        Validators.required,
        Validators.minLength(8),
        FormValidatorsService.passwordStrength(),
      ]),
      confirmPassword: this.fb.control('', [Validators.required]),
    },
    {
      validators: [FormValidatorsService.passwordsMatch('newPassword', 'confirmPassword')],
    },
  );

  readonly fieldErrors: Record<string, Record<string, string>> = {
    newPassword: {
      required: 'New password is required',
      minlength: 'Password must be at least 8 characters',
      passwordStrength:
        'Password must contain uppercase, lowercase, number, and special character (@$!%*?&#)',
    },
    confirmPassword: {
      required: 'Password confirmation is required',
      passwordsDoNotMatch: 'Passwords do not match',
    },
  };

  ngOnInit(): void {
    // Get token from query params
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'] || '';
      if (!this.token) {
        this.notification.showError('Invalid or missing reset token');
        this.router.navigate(['/auth/login']);
      }
    });
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    const { newPassword, confirmPassword } = this.resetPasswordForm.getRawValue();
    this.store.dispatch(
      new AuthActions.ResetPassword({
        token: this.token,
        newPassword,
        confirmPassword,
      }),
    );
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.set(!this.hideConfirmPassword());
  }

  getErrorMessage(fieldName: keyof ResetPasswordForm): string {
    const control = this.resetPasswordForm.get(fieldName);
    if (!control || !control.errors) return '';

    const errors = this.fieldErrors[fieldName];
    const errorKey = Object.keys(control.errors)[0];
    return errors[errorKey] || 'Invalid input';
  }
}
