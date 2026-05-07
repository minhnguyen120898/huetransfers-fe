import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  NonNullableFormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { User, UserRole } from '@core/models';
import { Dialog, DialogActions, DialogContent, DialogHeader } from '@shared/components';
import { CreateUserDto, UpdateUserDto } from '../../models/user-management.model';

export interface UserFormDialogData {
  user?: User;
}

interface UserForm {
  email: FormControl<string>;
  fullName: FormControl<string>;
  role: FormControl<UserRole>;
  tel: FormControl<string>;
}

@Component({
  selector: 'app-user-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    Dialog,
    DialogHeader,
    DialogContent,
    DialogActions,
  ],
  templateUrl: './user-form-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormDialog {
  private readonly fb = inject(NonNullableFormBuilder);
  readonly dialogRef = inject(MatDialogRef<UserFormDialog>);
  readonly data = inject<UserFormDialogData | null>(MAT_DIALOG_DATA);

  readonly UserRole = UserRole;

  readonly form = this.fb.group<UserForm>({
    email: this.fb.control(this.data?.user?.email ?? '', [Validators.required, Validators.email]),
    fullName: this.fb.control(this.data?.user?.fullName ?? '', [Validators.required]),
    role: this.fb.control(this.data?.user?.role ?? UserRole.USER, [Validators.required]),
    tel: this.fb.control(this.data?.user?.tel ?? ''),
  });

  get isEditMode(): boolean {
    return !!this.data?.user;
  }

  get dialogTitle(): string {
    return this.isEditMode ? 'Edit User' : 'Add User';
  }

  constructor() {
    if (this.isEditMode) {
      this.form.controls.email.disable();
      this.form.controls.role.disable();
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    if (this.isEditMode) {
      const dto: UpdateUserDto = {
        fullName: raw.fullName,
        tel: raw.tel || undefined,
      };
      this.dialogRef.close(dto);
    } else {
      const dto: CreateUserDto = {
        email: raw.email,
        fullName: raw.fullName,
        role: raw.role,
      };
      this.dialogRef.close(dto);
    }
  }
}
