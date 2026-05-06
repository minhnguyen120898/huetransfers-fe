import { MatDialogConfig } from '@angular/material/dialog';

export const BASE_DIALOG: Partial<MatDialogConfig> = {
  panelClass: '',
};

export const FULL_SCREEN_DIALOG: Partial<MatDialogConfig> = {
  panelClass: [
    'borderless-dialog',
    'mat-dialog-content-full-width',
    'full-screen-dialog',
    'no-scroll',
  ],
  maxWidth: '100vw',
  maxHeight: '100vh',
  width: '100%',
  height: '100%',
};

export const FULL_SCREEN_DIALOG_WITHOUT_ACTIONS: Partial<MatDialogConfig> = {
  panelClass: [
    'borderless-dialog',
    'mat-dialog-content-full-width',
    'full-screen-dialog-without-actions',
    'no-scroll',
  ],
  maxWidth: '100vw',
  maxHeight: '100vh',
  width: '100%',
  height: '100%',
};

export const SMALL_DIALOG: Partial<MatDialogConfig> = {
  ...BASE_DIALOG,
  width: '400px',
  maxWidth: '90vw',
};

export const MEDIUM_DIALOG: Partial<MatDialogConfig> = {
  ...BASE_DIALOG,
  width: '600px',
  maxWidth: '90vw',
};

export const LARGE_DIALOG: Partial<MatDialogConfig> = {
  ...BASE_DIALOG,
  width: '900px',
  maxWidth: '90vw',
};

export const EXTRA_LARGE_DIALOG: Partial<MatDialogConfig> = {
  ...BASE_DIALOG,
  width: '1080px',
  maxWidth: '90vw',
  maxHeight: '90vh',
};

export const EXTRA_EXTRA_LARGE_DIALOG: Partial<MatDialogConfig> = {
  ...BASE_DIALOG,
  width: '90vw',
  maxWidth: '90vw',
};

export const NINETY_PERCENT_DIALOG: Partial<MatDialogConfig> = {
  panelClass: ['ninety-percent-dialog', 'no-scroll'],
  width: '90vw',
  maxWidth: '90vw',
  maxHeight: '90vh',
  height: '90vh',
};

export const NINETY_PERCENT_DIALOG_FULL_WIDTH: Partial<MatDialogConfig> = {
  panelClass: ['ninety-percent-dialog', 'mat-dialog-content-full-width', 'no-scroll'],
  width: '90vw',
  maxWidth: '90vw',
  maxHeight: '90vh',
  height: '90vh',
};

export const NINETY_PERCENT_DIALOG_WITHOUT_ACTIONS: Partial<MatDialogConfig> = {
  panelClass: ['ninety-percent-dialog-without-actions'],
  width: '90vw',
  maxWidth: '90vw',
  maxHeight: '90vh',
  height: '90vh',
};

export const NINETY_PERCENT_DIALOG_WITHOUT_ACTIONS_NO_SCROLL: Partial<MatDialogConfig> = {
  panelClass: [
    'ninety-percent-dialog-without-actions',
    'mat-dialog-content-full-width',
    'no-scroll',
  ],
  width: '90vw',
  maxWidth: '90vw',
  maxHeight: '90vh',
  height: '90vh',
};

export const NINETY_PERCENT_DIALOG_WITH_ONLY_CONTENT: Partial<MatDialogConfig> = {
  panelClass: ['ninety-percent-dialog-with-only-content'],
  width: '90vw',
  maxWidth: '90vw',
  maxHeight: '90vh',
  height: '90vh',
};
