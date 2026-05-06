import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-table-header-title',
  standalone: true,
  imports: [MatCardModule],
  template: `<h4 mat-card-title><ng-content></ng-content></h4>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableHeaderTitle {}
