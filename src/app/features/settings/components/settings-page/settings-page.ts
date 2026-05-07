import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChangePassword } from '../change-password/change-password';
import { UpdateInformation } from '../update-information/update-information';

@Component({
  selector: 'app-settings-page',
  imports: [ChangePassword, UpdateInformation],
  templateUrl: './settings-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent {}
