import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly SELECTED_TOUR_KEY = 'selectedTourId';

  getSelectedTourId(): string | null {
    try {
      return localStorage.getItem(this.SELECTED_TOUR_KEY);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  setSelectedTourId(tourId: string | null): void {
    try {
      if (tourId) {
        localStorage.setItem(this.SELECTED_TOUR_KEY, tourId);
      } else {
        localStorage.removeItem(this.SELECTED_TOUR_KEY);
      }
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }

  clearSelectedTourId(): void {
    try {
      localStorage.removeItem(this.SELECTED_TOUR_KEY);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}
