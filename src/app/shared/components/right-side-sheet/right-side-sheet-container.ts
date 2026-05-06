import {
  Component,
  ViewChild,
  ViewContainerRef,
  AfterViewInit,
  ComponentRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SideSheetConfig } from './right-side-sheet.service';

@Component({
  selector: 'app-right-side-sheet-container',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full flex flex-col bg-white shadow-2xl">
      <!-- Header -->
      <div class="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
        <h3 class="text-xl font-semibold m-0">{{ config?.title }}</h3>
        <button
          mat-icon-button
          (click)="close()"
          class="hover:bg-gray-100 rounded-full transition-colors"
        >
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto">
        <ng-container #contentContainer />
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        width: 100%;
        animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
        }
        to {
          transform: translateX(0);
        }
      }
    `,
  ],
})
export class RightSideSheetContainer implements AfterViewInit {
  @ViewChild('contentContainer', { read: ViewContainerRef })
  contentContainer!: ViewContainerRef;

  config?: SideSheetConfig;
  closeCallback?: () => void;

  private componentRef?: ComponentRef<any>;

  ngAfterViewInit(): void {
    if (this.config?.component) {
      this.componentRef = this.contentContainer.createComponent(this.config.component);

      // Pass data to the component
      // The component should define which input it expects (e.g., bookingId, data, etc.)
      if (this.config.data) {
        const instance = this.componentRef.instance as any;

        // Try to set common input names
        if ('bookingId' in instance) {
          instance.bookingId = this.config.data;
        } else if ('data' in instance) {
          instance.data = this.config.data;
        } else if ('id' in instance) {
          instance.id = this.config.data;
        }

        // Trigger change detection
        this.componentRef.changeDetectorRef.detectChanges();
      }
    }
  }

  close(): void {
    this.closeCallback?.();
  }
}
