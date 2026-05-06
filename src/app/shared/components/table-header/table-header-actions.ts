import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-table-header-actions',
  standalone: true,
  template: `<ng-content></ng-content>`,
  host: {
    class: 'flex flex-row items-start gap-2 flex-wrap justify-end',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableHeaderActions {}
