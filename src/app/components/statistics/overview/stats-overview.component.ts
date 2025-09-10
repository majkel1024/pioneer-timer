import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthlyData } from '../../../models';
import { PioneerTimerService } from '../../../services/pioneer-timer.service';

@Component({
  selector: 'app-stats-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-overview">
      <!-- Monthly Progress Card -->
      <div class="stat-card monthly-summary">
        <div class="card-header">
          <button class="nav-button nav-prev" (click)="onNavigateMonth('prev')" title="Poprzedni miesiąc">
            <span class="arrow-left">‹</span>
          </button>
          <h3>{{ selectedMonthYear }}</h3>
          <button class="nav-button nav-next" (click)="onNavigateMonth('next')" title="Następny miesiąc">
            <span class="arrow-right">›</span>
          </button>
        </div>
        
        <div class="stat-main">
          <div class="stat-value">{{ formatTime(currentMonthHours.countableHours) }}</div>
          <div class="stat-label">z {{ formatTime(monthlyGoalInHours) }} celu miesięcznego</div>
        </div>

        <div class="progress-indicator">
          <div class="progress-bar" [style.--expected-position]="getMonthlyExpectedPosition() + '%'">
            <div class="progress-fill" 
                 [style.width.%]="getMonthlyProgress()"></div>
            <div class="progress-expected-marker" 
                 *ngIf="showMonthlyExpectedMarker()"
                 [style.left.%]="getMonthlyExpectedPosition()"
                 title="Dzisiaj powinieneś mieć: {{ formatTime(monthlyExpectedToday) }}">
            </div>
          </div>
          <div class="progress-text">{{ getMonthlyProgress().toFixed(0) }}% ukończone</div>
        </div>

        <div class="stat-detail">{{ monthlyBreakdownText }}</div>
        
        <div class="expected-today" *ngIf="monthlyExpectedToday > 0">
          <span class="expected-label">Dzisiaj powinieneś mieć:</span>
          <span class="expected-value">{{ formatTime(monthlyExpectedToday) }}</span>
        </div>
        
        <div class="target-comparison" [class]="getMonthlyDifferenceClass()" *ngIf="showMonthlyComparison()">
          <span class="comparison-label">{{ getMonthlyDifferenceText() }}</span>
          <span class="comparison-value">{{ formatTime(Math.abs(monthlyDifference)) }}</span>
        </div>
        
        <div class="stat-detail" *ngIf="!showMonthlyComparison()">
          {{ getMonthlyStatusText() }}
        </div>
      </div>

      <!-- Yearly Progress Card -->
      <div class="stat-card yearly-summary">
        <div class="card-header">
          <button class="nav-button nav-prev" (click)="onNavigateYear('prev')" title="Poprzedni rok służbowy">
            <span class="arrow-left">‹</span>
          </button>
          <h3>Rok służbowy {{ selectedServiceYear }}</h3>
          <button class="nav-button nav-next" (click)="onNavigateYear('next')" title="Następny rok służbowy">
            <span class="arrow-right">›</span>
          </button>
        </div>
        
        <div class="stat-main">
          <div class="stat-value">{{ formatTime(currentYearCountable) }}</div>
          <div class="stat-label">z {{ formatTime(yearlyGoal) }} celu rocznego</div>
        </div>

        <div class="progress-indicator">
          <div class="progress-bar" [style.--expected-position]="getYearlyExpectedPosition() + '%'">
            <div class="progress-fill" 
                 [style.width.%]="Math.min(goalProgress, 100)"></div>
            <div class="progress-expected-marker" 
                 *ngIf="showYearlyExpectedMarker()"
                 [style.left.%]="getYearlyExpectedPosition()"
                 title="Dzisiaj powinieneś mieć: {{ formatTime(yearlyExpectedToday) }}">
            </div>
          </div>
          <div class="progress-text">{{ goalProgress.toFixed(0) }}% celu osiągnięte</div>
        </div>

        <div class="stat-detail">{{ yearBreakdownText }}</div>
        
        <div class="expected-today" *ngIf="yearlyExpectedToday > 0">
          <span class="expected-label">Dzisiaj powinieneś mieć:</span>
          <span class="expected-value">{{ formatTime(yearlyExpectedToday) }}</span>
        </div>
        
        <div class="target-comparison" [class]="getYearlyDifferenceClass()" *ngIf="showYearlyComparison()">
          <span class="comparison-label">{{ getYearlyDifferenceText() }}</span>
          <span class="comparison-value">{{ formatTime(Math.abs(yearlyDifference)) }}</span>
        </div>
        
        <div class="stat-detail" *ngIf="!showYearlyComparison()">
          {{ getYearlyStatusText() }}
        </div>
        
        <div class="goal-status" *ngIf="goalProgress >= 100">
          🎉 Cel roczny osiągnięty!
        </div>
      </div>
    </div>
  `
})
export class StatsOverviewComponent {
  @Input() currentMonthHours!: MonthlyData;
  @Input() currentYearCountable!: number;
  @Input() goalProgress!: number;
  @Input() hoursToGoal!: number;
  @Input() yearBreakdownText!: string;
  @Input() yearlyGoal!: number;
  @Input() monthlyTarget!: number;
  @Input() yearlyTarget!: number;
  @Input() monthlyDifference!: number;
  @Input() yearlyDifference!: number;
  @Input() monthlyExpectedToday!: number;
  @Input() yearlyExpectedToday!: number;
  @Input() selectedMonthYear!: string;
  @Input() selectedServiceYear!: string;
  @Input() monthlyBreakdownText!: string;
  
  @Output() navigateMonth = new EventEmitter<'prev' | 'next'>();
  @Output() navigateYear = new EventEmitter<'prev' | 'next'>();

  Math = Math;
  monthlyGoalInHours = 50; // 50 godzin
  private pioneerService = inject(PioneerTimerService);

  formatTime(minutes: number): string {
    return this.pioneerService.formatTime(minutes);
  }

  getMonthlyProgress(): number {
    const fullMonthlyGoal = 50; // Zawsze porównuj do pełnych 50h
    return Math.min((this.currentMonthHours.countableHours / fullMonthlyGoal) * 100, 100);
  }

  getMonthlyDifferenceClass(): string {
    if (this.monthlyDifference > 0) return 'positive';
    if (this.monthlyDifference < 0) return 'negative';
    return 'neutral';
  }

  getMonthlyDifferenceText(): string {
    if (this.monthlyDifference > 0) return 'Powyżej celu o';
    if (this.monthlyDifference < 0) return 'Poniżej celu o';
    return 'Dokładnie w celu';
  }

  getYearlyDifferenceClass(): string {
    if (this.yearlyDifference > 0) return 'positive';
    if (this.yearlyDifference < 0) return 'negative';
    return 'neutral';
  }

  getYearlyDifferenceText(): string {
    if (this.yearlyDifference > 0) return 'Przed planem o';
    if (this.yearlyDifference < 0) return 'Za planem o';
    return 'Zgodnie z planem';
  }

  onNavigateMonth(direction: 'prev' | 'next'): void {
    this.navigateMonth.emit(direction);
  }

  onNavigateYear(direction: 'prev' | 'next'): void {
    this.navigateYear.emit(direction);
  }

  showMonthlyComparison(): boolean {
    // Pokaż porównanie tylko jeśli target > 0 (nie przyszłość) i różnica != 0
    return this.monthlyTarget > 0 && this.monthlyDifference !== 0;
  }

  showYearlyComparison(): boolean {
    // Pokaż porównanie tylko jeśli target > 0 (nie przyszłość) i różnica != 0
    return this.yearlyTarget > 0 && this.yearlyDifference !== 0;
  }

  getMonthlyStatusText(): string {
    if (this.monthlyTarget === 0) {
      return 'Miesiąc jeszcze się nie rozpoczął';
    }
    if (this.monthlyDifference === 0) {
      return 'Dokładnie w celu';
    }
    return '';
  }

  getYearlyStatusText(): string {
    if (this.yearlyTarget === 0) {
      return 'Rok służbowy jeszcze się nie rozpoczął';
    }
    if (this.yearlyDifference === 0) {
      return 'Dokładnie zgodnie z planem';
    }
    return '';
  }

  // Pozycje markerów "dzisiaj powinieneś mieć" na paskach postępu
  getMonthlyExpectedPosition(): number {
    if (this.monthlyExpectedToday <= 0) return 0;
    const monthlyGoal = 50; // 50 godzin miesięcznie
    return Math.min((this.monthlyExpectedToday / monthlyGoal) * 100, 100);
  }

  getYearlyExpectedPosition(): number {
    if (this.yearlyExpectedToday <= 0) return 0;
    return Math.min((this.yearlyExpectedToday / this.yearlyGoal) * 100, 100);
  }

  // Sprawdź czy pokazać marker (tylko dla bieżącego miesiąca/roku)
  showMonthlyExpectedMarker(): boolean {
    return this.monthlyExpectedToday > 0 && this.monthlyTarget > 0;
  }

  showYearlyExpectedMarker(): boolean {
    return this.yearlyExpectedToday > 0 && this.yearlyTarget > 0;
  }
}
