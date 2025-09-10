import { Injectable } from '@angular/core';
import { PioneerTimerService } from '../../../services/pioneer-timer.service';
import { NavigationState, StatisticsTargets } from './statistics-navigation.service';

@Injectable({
  providedIn: 'root'
})
export class StatisticsCalculationService {

  constructor(private pioneerService: PioneerTimerService) {}

  calculateTargetsAndDifferences(
    state: NavigationState,
    currentMonthCountableHours: number,
    currentYearCountable: number
  ): StatisticsTargets {
    const today = new Date(); // Rzeczywista data (10 września 2025)
    const selectedDate = new Date(state.selectedYear, state.selectedMonth, 1);
    const monthlyGoal = 50; // 50 godzin per miesiąc
    const yearlyGoal = 600; // 600 godzin per rok służby

    // Obliczenia miesięczne
    const { monthlyTarget, monthlyExpectedToday, monthlyDifference } = 
      this.calculateMonthlyTargets(today, selectedDate, state, monthlyGoal, currentMonthCountableHours);

    // Obliczenia roczne
    const { yearlyTarget, yearlyExpectedToday, yearlyDifference } = 
      this.calculateYearlyTargets(today, state, yearlyGoal, currentYearCountable);

    return {
      monthlyTarget,
      yearlyTarget,
      monthlyDifference,
      yearlyDifference,
      monthlyExpectedToday,
      yearlyExpectedToday
    };
  }

  private calculateMonthlyTargets(
    today: Date,
    selectedDate: Date,
    state: NavigationState,
    monthlyGoal: number,
    currentMonthCountableHours: number
  ) {
    const isCurrentMonth = state.selectedYear === today.getFullYear() && state.selectedMonth === today.getMonth();
    const isPastMonth = selectedDate < new Date(today.getFullYear(), today.getMonth(), 1);
    const isFutureMonth = selectedDate > new Date(today.getFullYear(), today.getMonth(), 1);

    let monthlyTarget: number;
    let monthlyExpectedToday: number;
    let monthlyDifference: number;

    if (isPastMonth) {
      // Przeszłość - pełny cel miesięczny
      monthlyTarget = monthlyGoal;
      monthlyExpectedToday = monthlyGoal;
    } else if (isCurrentMonth) {
      // Teraźniejszość - proporcjonalnie do dnia w miesiącu
      const daysInMonth = new Date(state.selectedYear, state.selectedMonth + 1, 0).getDate();
      const currentDay = today.getDate();
      
      // "Dzisiaj powinieneś mieć" - dzienne tempo × dni które minęły
      const dailyGoal = monthlyGoal / daysInMonth;
      monthlyExpectedToday = dailyGoal * currentDay;
      
      // Cel proporcjonalny (dla porównania "poniżej/powyżej celu")
      monthlyTarget = monthlyExpectedToday;
    } else {
      // Przyszłość - brak celu
      monthlyTarget = 0;
      monthlyExpectedToday = 0;
    }

    // Oblicz różnicę miesięczną
    if (isFutureMonth) {
      monthlyDifference = 0;
    } else {
      monthlyDifference = currentMonthCountableHours - monthlyTarget;
    }

    return { monthlyTarget, monthlyExpectedToday, monthlyDifference };
  }

  private calculateYearlyTargets(
    today: Date,
    state: NavigationState,
    yearlyGoal: number,
    currentYearCountable: number
  ) {
    const selectedServiceYear = state.selectedServiceYear;
    const currentServiceYear = this.pioneerService.getServiceYear(today);

    let yearlyTarget: number;
    let yearlyExpectedToday: number;
    let yearlyDifference: number;

    if (selectedServiceYear < currentServiceYear) {
      // Przeszły rok służbowy - pełny cel
      yearlyTarget = yearlyGoal;
      yearlyExpectedToday = yearlyGoal;
    } else if (selectedServiceYear === currentServiceYear) {
      // Bieżący rok służbowy - proporcjonalnie do dnia
      const serviceYearStart = new Date(selectedServiceYear, 8, 1); // 1 września
      const serviceYearEnd = new Date(selectedServiceYear + 1, 7, 31); // 31 sierpnia
      const totalDaysInServiceYear = Math.ceil((serviceYearEnd.getTime() - serviceYearStart.getTime()) / (1000 * 60 * 60 * 24));
      const daysPassed = Math.ceil((today.getTime() - serviceYearStart.getTime()) / (1000 * 60 * 60 * 24));
      
      // "Dzisiaj powinieneś mieć" - dzienne tempo × dni które minęły
      const dailyYearlyGoal = yearlyGoal / totalDaysInServiceYear;
      yearlyExpectedToday = Math.max(0, dailyYearlyGoal * daysPassed);
      
      // Cel proporcjonalny (dla porównania "poniżej/powyżej celu")
      yearlyTarget = yearlyExpectedToday;
    } else {
      // Przyszły rok służbowy - brak celu
      yearlyTarget = 0;
      yearlyExpectedToday = 0;
    }

    // Oblicz różnicę roczną
    if (selectedServiceYear > currentServiceYear) {
      yearlyDifference = 0;
    } else {
      yearlyDifference = currentYearCountable - yearlyTarget;
    }

    return { yearlyTarget, yearlyExpectedToday, yearlyDifference };
  }
}
