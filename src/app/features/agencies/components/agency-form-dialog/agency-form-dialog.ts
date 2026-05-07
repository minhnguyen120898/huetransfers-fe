import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TravelAgency } from '@core/models/partner.model';
import { Dialog, DialogActions, DialogContent, DialogHeader } from '@shared/components';

export interface AgencyFormDialogData {
  agency?: TravelAgency;
}

interface AgencyForm {
  name: FormControl<string>;
  tel: FormControl<string>;
  address: FormControl<string>;
  note: FormControl<string>;
}

@Component({
  selector: 'app-agency-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    Dialog,
    DialogActions,
    DialogContent,
    DialogHeader,
  ],
  templateUrl: './agency-form-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgencyFormDialog {
  private readonly fb = inject(NonNullableFormBuilder);
  readonly dialogRef = inject(MatDialogRef<AgencyFormDialog>);
  readonly data = inject<AgencyFormDialogData | null>(MAT_DIALOG_DATA);

  readonly agencyForm = this.fb.group<AgencyForm>({
    name: this.fb.control(this.data?.agency?.name || '', [Validators.required]),
    tel: this.fb.control(this.data?.agency?.tel || ''),
    address: this.fb.control(this.data?.agency?.address || ''),
    note: this.fb.control(this.data?.agency?.note || '', []),
  });

  get isEditMode(): boolean {
    return !!this.data?.agency;
  }

  get dialogTitle(): string {
    return this.isEditMode ? 'Edit Agency' : 'Add Agency';
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSubmit(): void {
    if (this.agencyForm.valid) {
      const formValue = this.agencyForm.getRawValue();
      this.dialogRef.close(formValue);
    }
  }
}
