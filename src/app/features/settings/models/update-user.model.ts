import { FormControl } from '@angular/forms';

export interface UpdateUserForm {
  email: FormControl<string>;
  fullName: FormControl<string>;
  tel: FormControl<string>;
}
