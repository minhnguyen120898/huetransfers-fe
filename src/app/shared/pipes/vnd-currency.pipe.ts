import { Pipe, PipeTransform } from '@angular/core';

/**
 * VND Currency Pipe
 *
 * Formats numbers as Vietnamese Dong currency.
 *
 * @example
 * ```html
 * <!-- Basic usage -->
 * <p>{{ 1000000 | vndCurrency }}</p>
 * <!-- Output: 1,000,000 ₫ -->
 *
 * <!-- Without symbol -->
 * <p>{{ 1000000 | vndCurrency:false }}</p>
 * <!-- Output: 1,000,000 -->
 *
 * <!-- Custom symbol -->
 * <p>{{ 1000000 | vndCurrency:true:'VND' }}</p>
 * <!-- Output: 1,000,000 VND -->
 *
 * <!-- With nullable values -->
 * <p>{{ nullValue | vndCurrency }}</p>
 * <!-- Output: 0 ₫ -->
 * ```
 */
@Pipe({
  name: 'vndCurrency',
})
export class VndCurrencyPipe implements PipeTransform {
  /**
   * Transform a number to VND currency format
   *
   * @param value - The number to format
   * @param showSymbol - Whether to show currency symbol (default: true)
   * @param symbol - Custom currency symbol (default: '₫')
   * @returns Formatted currency string
   */
  transform(
    value: number | null | undefined,
    showSymbol: boolean = true,
    symbol: string = '₫',
  ): string {
    // Handle null/undefined
    const numericValue = value ?? 0;

    // Format using Vietnamese locale
    // Vietnam uses: 1,000,000 (commas as thousand separators)
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericValue);

    // Add currency symbol if requested
    return showSymbol ? `${formatted} ${symbol}` : formatted;
  }
}
