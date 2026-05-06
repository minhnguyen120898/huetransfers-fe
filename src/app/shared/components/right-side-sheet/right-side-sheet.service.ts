import { Injectable, inject, Injector, Type } from '@angular/core';
import { Overlay, OverlayRef, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { RightSideSheetContainer } from './right-side-sheet-container';

export interface SideSheetConfig<T = any> {
  title: string;
  component: Type<any>;
  data?: T;
  width?: string;
}

export interface SideSheetRef<T = any> {
  close: () => void;
  config: SideSheetConfig<T>;
}

@Injectable({
  providedIn: 'root',
})
export class RightSideSheetService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);
  private overlayRef: OverlayRef | null = null;
  private currentRef: SideSheetRef | null = null;

  open<T = any>(config: SideSheetConfig<T>): SideSheetRef<T> {
    // Close existing sheet if open
    if (this.overlayRef) {
      this.close();
    }

    // Create overlay config
    const overlayConfig = new OverlayConfig({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-dark-backdrop',
      positionStrategy: this.overlay.position().global().right('0').top('0'),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      width: config.width || '400px',
      height: '100%',
      panelClass: 'right-side-sheet-panel',
    });

    // Create overlay
    this.overlayRef = this.overlay.create(overlayConfig);

    // Create component portal with our content wrapper
    const portal = new ComponentPortal(RightSideSheetContainer, null, this.injector);
    const containerRef = this.overlayRef.attach(portal);

    // Set config and render content
    const instance = containerRef.instance as RightSideSheetContainer;
    instance.config = config;
    instance.closeCallback = () => this.close();

    // Handle backdrop click
    this.overlayRef.backdropClick().subscribe(() => this.close());

    // Handle ESC key
    this.overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        this.close();
      }
    });

    this.currentRef = {
      close: () => this.close(),
      config,
    };

    return this.currentRef;
  }

  close(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
      this.currentRef = null;
    }
  }
}
