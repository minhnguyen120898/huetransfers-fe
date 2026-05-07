import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
import { RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthActions } from '../store/auth.actions';
import { AuthState } from '../store/auth.state';

interface ForgotPasswordForm {
  email: FormControl<string>;
}

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.html',
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
export class ForgotPassword {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly store = inject(Store);

  readonly loading = this.store.selectSignal(AuthState.loading);
  readonly resetEmailSent = this.store.selectSignal(AuthState.resetEmailSent);

  readonly forgotPasswordForm: FormGroup<ForgotPasswordForm> = this.fb.group({
    email: this.fb.control('', [Validators.required, Validators.email]),
  });

  readonly fieldErrors: Record<string, Record<string, string>> = {
    email: {
      required: 'Email is required',
      email: 'Please enter a valid email address',
    },
  };

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    const { email } = this.forgotPasswordForm.getRawValue();
    this.store.dispatch(new AuthActions.ForgotPassword({ email }));
  }

  getErrorMessage(fieldName: keyof ForgotPasswordForm): string {
    const control = this.forgotPasswordForm.get(fieldName);
    if (!control || !control.errors) return '';

    const errors = this.fieldErrors[fieldName];
    const errorKey = Object.keys(control.errors)[0];
    return errors[errorKey] || 'Invalid input';
  }
}
