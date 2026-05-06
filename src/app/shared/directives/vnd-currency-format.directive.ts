import { Directive, ElementRef, HostListener, inject, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * VND Currency Format Directive
 *
 * Formats input fields with Vietnamese currency formatting (commas as thousand separators).
 * - Display value: Formatted with commas (e.g., "1,000,000")
 * - Model value: Raw number (e.g., 1000000)
 * - Cursor position is preserved during formatting
 *
 * @example
 * ```html
 * <input matInput type="text" formControlName="price" vndCurrencyFormat />
 * <span matSuffix>₫</span>
 * ```
 *
 * Features:
 * - Auto-formats while typing
 * - Preserves cursor position
 * - Handles backspace, delete, and paste operations
 * - Stores raw number in form control
 * - Implements ControlValueAccessor to prevent value conflicts
 */
@Directive({
  selector: 'input[vndCurrencyFormat]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VndCurrencyFormatDirective),
      multi: true,
    },
  ],
})
export class VndCurrencyFormatDirective implements ControlValueAccessor {
  private readonly el = inject(ElementRef);

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  // ControlValueAccessor implementation
  writeValue(value: number | null): void {
    const input = this.el.nativeElement as HTMLInputElement;
    const numericValue = value ?? 0;
    input.value = this.formatNumber(numericValue);
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    const input = this.el.nativeElement as HTMLInputElement;
    input.disabled = isDisabled;
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart || 0;
    const oldValue = input.value;

    // Remove all non-digit characters
    const rawValue = oldValue.replace(/[^\d]/g, '');

    // Convert to number (or 0 if empty)
    const numericValue = rawValue ? parseInt(rawValue, 10) : 0;

    // Notify form control of the change (this will emit valueChanges with the NUMBER)
    this.onChange(numericValue);

    // Format display value
    const formattedValue = this.formatNumber(numericValue);

    // Set formatted value
    input.value = formattedValue;

    // Restore cursor position (accounting for added/removed commas)
    const rawDigitsBeforeCursor = oldValue
      .substring(0, cursorPosition)
      .replace(/[^\d]/g, '').length;
    let newCursorPosition = 0;
    let digitCount = 0;

    for (let i = 0; i < formattedValue.length; i++) {
      if (formattedValue[i].match(/\d/)) {
        digitCount++;
        if (digitCount === rawDigitsBeforeCursor) {
          newCursorPosition = i + 1;
          break;
        }
      }
    }

    // Handle edge case where cursor is at the end
    if (digitCount < rawDigitsBeforeCursor || rawDigitsBeforeCursor === 0) {
      newCursorPosition = formattedValue.length;
    }

    input.setSelectionRange(newCursorPosition, newCursorPosition);
  }

  @HostListener('blur')
  onBlur(): void {
    // Mark as touched
    this.onTouched();

    // Ensure value is formatted on blur
    const input = this.el.nativeElement as HTMLInputElement;
    const rawValue = input.value.replace(/[^\d]/g, '');
    const numericValue = rawValue ? parseInt(rawValue, 10) : 0;

    input.value = this.formatNumber(numericValue);
  }

  @HostListener('focus')
  onFocus(): void {
    // Select all on focus for easy editing (optional behavior)
    const input = this.el.nativeElement as HTMLInputElement;
    if (input.value === '0') {
      input.select();
    }
  }

  /**
   * Format a number with commas as thousand separators
   */
  private formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
}
