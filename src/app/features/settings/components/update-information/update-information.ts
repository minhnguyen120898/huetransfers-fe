import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UpdateUserForm } from '@features/settings/models/update-user.model';
import { SettingsActions } from '@features/settings/store/settings.actions';
import { SettingsState } from '@features/settings/store/settings.state';
import { AuthState } from '@features/auth/store/auth.state';
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-update-information',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    AsyncPipe,
  ],
  templateUrl: './update-information.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateInformation {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);

  readonly loading$ = this.store.select(SettingsState.updateUserLoading);

  readonly form = this.fb.group<UpdateUserForm>({
    email: new FormControl(
      { value: '', disabled: true },
      { nonNullable: true, validators: [Validators.required] },
    ),
    fullName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    tel: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() {
    // Load current user data into form
    const user = this.store.selectSnapshot(AuthState.user);
    if (user) {
      this.form.patchValue({
        email: user.email,
        fullName: user.fullName,
        tel: user.tel || '',
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Prevent submission if already loading
    const isLoading = this.store.selectSnapshot(SettingsState.updateUserLoading);
    if (isLoading) {
      return;
    }

    // Get current user ID
    const user = this.store.selectSnapshot(AuthState.user);
    if (!user || !user.id) {
      return;
    }

    const { tel, fullName } = this.form.getRawValue();
    this.store.dispatch(
      new SettingsActions.UpdateInformation(user.id, {
        fullName,
        tel,
      }),
    );
  }
}
