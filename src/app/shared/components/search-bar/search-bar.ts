import { Component, input, output, signal, effect, ChangeDetectionStrategy } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  imports: [MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, FormsModule],
  templateUrl: './search-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBar {
  placeholder = input<string>('Search...');
  debounceTime = input<number>(300);

  searchChange = output<string>();

  searchValue = signal<string>('');
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private isInitialized = false;

  constructor() {
    effect(() => {
      const value = this.searchValue();
      if (!this.isInitialized) {
        this.isInitialized = true;
        return;
      }
      this.debounceSearch(value);
    });
  }

  onSearchInput(value: string): void {
    this.searchValue.set(value);
  }

  onClear(): void {
    this.searchValue.set('');
  }

  private debounceSearch(value: string): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.searchChange.emit(value);
    }, this.debounceTime());
  }
}
