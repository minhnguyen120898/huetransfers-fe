import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { AddUserForm } from '../../models/add-user.model';
import { SettingsActions } from '../../store/settings.actions';
import { SettingsState } from '../../store/settings.state';
import { AsyncPipe } from '@angular/common';

/**
 * Add User Component
 * Allows admins to create new users
 */
@Component({
  selector: 'app-add-user',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    AsyncPipe,
  ],
  templateUrl: './add-user.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddUserComponent {
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  readonly loading$ = this.store.select(SettingsState.createUserLoading);

  readonly form = this.fb.group<AddUserForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    fullName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    role: new FormControl('user', { nonNullable: true, validators: [Validators.required] }),
  });

  readonly roles = [
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' },
  ];

  readonly fieldErrors: Record<string, Record<string, string>> = {
    email: {
      required: 'Email is required',
      email: 'Invalid email format',
    },
    fullName: {
      required: 'Full name is required',
    },
    role: {
      required: 'Role is required',
    },
  };

  constructor() {
    // Reset form on successful user creation
    this.actions$
      .pipe(
        ofActionSuccessful(SettingsActions.CreateUserSuccess),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.form.reset({ role: 'user' });
      });
  }

  getErrorMessage(fieldName: keyof AddUserForm): string {
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
    const isLoading = this.store.selectSnapshot(SettingsState.createUserLoading);
    if (isLoading) {
      return;
    }

    const { email, fullName, role } = this.form.getRawValue();
    this.store.dispatch(
      new SettingsActions.CreateUser({
        email,
        fullName,
        role,
      }),
    );
  }
}
