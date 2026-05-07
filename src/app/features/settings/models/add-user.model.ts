import { FormControl } from '@angular/forms';

export interface AddUserForm {
  email: FormControl<string>;
  fullName: FormControl<string>;
  role: FormControl<string>;
}
