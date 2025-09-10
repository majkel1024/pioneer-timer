import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PioneerTimerService } from '../../../services/pioneer-timer.service';

export interface ComparisonData {
  monthlyTarget: number;
  yearlyTarget: number;
  monthlyDifference: number;
  yearlyDifference: number;
  currentMonthHours: number;
  currentYearCountable: number;
}

@Component({
  selector: 'app-comparison-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="current-vs-target">
      <h3>Postęp na dzisiaj</h3>
      <div class="comparison-stats">
        <div class="comparison-card">
          <h4>Miesiąc bieżący</h4>
          <div class="comparison-row">
            <div class="actual">
              <span class="label">Masz:</span>
              <span class="value">{{ formatTime(data.currentMonthHours) }}</span>
            </div>
            <div class="target">
              <span class="label">Powinien być:</span>
              <span class="value">{{ formatTime(data.monthlyTarget) }}</span>
            </div>
          </div>
          <div class="difference" [class]="getMonthlyDifferenceClass()">
            <span class="difference-label">{{ getMonthlyDifferenceText() }}</span>
            <span class="difference-value">{{ formatTime(Math.abs(data.monthlyDifference)) }}</span>
          </div>
        </div>

        <div class="comparison-card">
          <h4>Rok służbowy</h4>
          <div class="comparison-row">
            <div class="actual">
              <span class="label">Masz:</span>
              <span class="value">{{ formatTime(data.currentYearCountable) }}</span>
            </div>
            <div class="target">
              <span class="label">Powinien być:</span>
              <span class="value">{{ formatTime(data.yearlyTarget) }}</span>
            </div>
          </div>
          <div class="difference" [class]="getYearlyDifferenceClass()">
            <span class="difference-label">{{ getYearlyDifferenceText() }}</span>
            <span class="difference-value">{{ formatTime(Math.abs(data.yearlyDifference)) }}</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ComparisonStatsComponent {
  @Input() data: ComparisonData = {
    monthlyTarget: 0,
    yearlyTarget: 0,
    monthlyDifference: 0,
    yearlyDifference: 0,
    currentMonthHours: 0,
    currentYearCountable: 0
  };

  Math = Math;

  constructor(private pioneerService: PioneerTimerService) {}

  formatTime(decimal: number): string {
    return this.pioneerService.formatTime(decimal);
  }

  getMonthlyDifferenceClass(): string {
    if (this.data.monthlyDifference > 0) return 'positive';
    if (this.data.monthlyDifference < 0) return 'negative';
    return 'neutral';
  }

  getYearlyDifferenceClass(): string {
    if (this.data.yearlyDifference > 0) return 'positive';
    if (this.data.yearlyDifference < 0) return 'negative';
    return 'neutral';
  }

  getMonthlyDifferenceText(): string {
    if (this.data.monthlyDifference > 0) return 'Jesteś na plus:';
    if (this.data.monthlyDifference < 0) return 'Jesteś na minus:';
    return 'Jesteś na celu:';
  }

  getYearlyDifferenceText(): string {
    if (this.data.yearlyDifference > 0) return 'Jesteś na plus:';
    if (this.data.yearlyDifference < 0) return 'Jesteś na minus:';
    return 'Jesteś na celu:';
  }
}
