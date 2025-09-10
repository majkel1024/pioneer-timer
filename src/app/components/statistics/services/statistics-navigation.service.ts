import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PioneerTimerService } from '../../../services/pioneer-timer.service';

export interface NavigationState {
  selectedMonth: number;
  selectedYear: number;
  selectedServiceYear: number;
}

export interface StatisticsTargets {
  monthlyTarget: number;
  yearlyTarget: number;
  monthlyDifference: number;
  yearlyDifference: number;
  monthlyExpectedToday: number;
  yearlyExpectedToday: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsNavigationService {
  private navigationStateSubject = new BehaviorSubject<NavigationState>({
    selectedMonth: new Date().getMonth(),
    selectedYear: new Date().getFullYear(),
    selectedServiceYear: 0
  });

  navigationState$ = this.navigationStateSubject.asObservable();
  private pioneerService = inject(PioneerTimerService);

  constructor() {
    // Initialize with current service year
    const today = new Date();
    const currentServiceYear = this.pioneerService.getServiceYear(today);
    this.navigationStateSubject.next({
      selectedMonth: today.getMonth(),
      selectedYear: today.getFullYear(),
      selectedServiceYear: currentServiceYear
    });
  }

  get currentState(): NavigationState {
    return this.navigationStateSubject.value;
  }

  navigateMonth(direction: 'prev' | 'next'): void {
    const state = { ...this.currentState };

    if (direction === 'prev') {
      if (state.selectedMonth === 0) {
        state.selectedMonth = 11;
        state.selectedYear--;
        // If we go back past September, go to previous service year
        if (state.selectedMonth >= 8 && state.selectedYear < state.selectedServiceYear) {
          state.selectedServiceYear--;
        }
      } else {
        state.selectedMonth--;
        // If we're going from September to August, we need to move to previous service year
        if (state.selectedMonth === 7) {
          state.selectedServiceYear--;
        }
      }
    } else {
      if (state.selectedMonth === 11) {
        state.selectedMonth = 0;
        state.selectedYear++;
        // If we go forward past August, go to next service year
        if (state.selectedMonth <= 7 && state.selectedYear > state.selectedServiceYear + 1) {
          state.selectedServiceYear++;
        }
      } else {
        state.selectedMonth++;
        // If we're going from August to September, we need to move to next service year
        if (state.selectedMonth === 8) {
          state.selectedServiceYear++;
        }
      }
    }

    this.navigationStateSubject.next(state);
  }

  navigateYear(direction: 'prev' | 'next'): void {
    const state = { ...this.currentState };

    if (direction === 'prev') {
      state.selectedServiceYear--;
      // Adjust calendar year if needed
      if (state.selectedMonth >= 8) {
        state.selectedYear = state.selectedServiceYear;
      } else {
        state.selectedYear = state.selectedServiceYear + 1;
      }
    } else {
      state.selectedServiceYear++;
      // Adjust calendar year if needed
      if (state.selectedMonth >= 8) {
        state.selectedYear = state.selectedServiceYear;
      } else {
        state.selectedYear = state.selectedServiceYear + 1;
      }
    }

    this.navigationStateSubject.next(state);
  }

  getSelectedMonthName(month: number): string {
    const monthNames = [
      'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
      'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
    ];
    return monthNames[month];
  }

  getSelectedMonthYear(month: number, year: number): string {
    return `${this.getSelectedMonthName(month)} ${year}`;
  }

  getSelectedServiceYearText(serviceYear: number): string {
    return `${serviceYear}/${serviceYear + 1}`;
  }
}
