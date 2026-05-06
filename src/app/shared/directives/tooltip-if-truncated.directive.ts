import { Directive, ElementRef, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

/**
 * Directive that only shows tooltip when text content is truncated/clipped
 * Works with both single-line truncate and multi-line line-clamp
 */
@Directive({
  selector: '[appTooltipIfTruncated]',
  hostDirectives: [
    {
      directive: MatTooltip,
      inputs: ['matTooltip', 'matTooltipPosition', 'matTooltipClass'],
    },
  ],
})
export class TooltipIfTruncatedDirective implements OnInit, OnDestroy {
  private readonly elementRef = inject(ElementRef);
  private readonly tooltip = inject(MatTooltip);
  private resizeObserver?: ResizeObserver;

  @Input() appTooltipIfTruncated = '';

  ngOnInit(): void {
    // Set the tooltip text
    this.tooltip.message = this.appTooltipIfTruncated;

    // Check if content is truncated initially
    this.checkTruncation();

    // Re-check on element resize
    this.resizeObserver = new ResizeObserver(() => {
      this.checkTruncation();
    });
    this.resizeObserver.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private checkTruncation(): void {
    const element = this.elementRef.nativeElement as HTMLElement;

    // Check if content is truncated
    const isTruncated =
      element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;

    // Enable/disable tooltip based on truncation
    this.tooltip.disabled = !isTruncated;
  }
}
