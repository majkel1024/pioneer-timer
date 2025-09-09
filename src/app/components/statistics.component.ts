import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PioneerTimerService } from '../services/pioneer-timer.service';
import { ServiceEntry, Settings, MonthlyData } from '../models';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Statystyki</h2>
    
    <div class="current-service-year">
      <h3>Rok służbowy {{ serviceYear }}/{{ serviceYear + 1 }}</h3>
      <div class="service-year-info">
        <span>1 września {{ serviceYear }} - 31 sierpnia {{ serviceYear + 1 }}</span>
      </div>
    </div>

    <div class="stats-overview">
      <div class="stat-card">
        <h3>Bieżący miesiąc</h3>
        <div class="stat-value">{{ formatTime(currentMonthHours.countableHours) }}</div>
        <div class="stat-label">godzin</div>
        <div class="stat-detail">{{ getMonthBreakdownText(currentMonthHours) }}</div>
      </div>
      
      <div class="stat-card">
        <h3>Bieżący rok służbowy</h3>
        <div class="stat-value">{{ formatTime(currentYearCountable) }}</div>
        <div class="stat-label">godzin</div>
        <div class="stat-detail">{{ getYearBreakdownText() }}</div>
      </div>
      
      <div class="stat-card">
        <h3>Postęp celu</h3>
        <div class="stat-value">{{ goalProgress.toFixed(1) }}%</div>
        <div class="stat-label">ukończone</div>
        <div class="stat-detail">
          {{ hoursToGoal > 0 ? formatTime(hoursToGoal) + ' do celu' : 'Cel osiągnięty!' }}
        </div>
      </div>
    </div>

    <div class="daily-requirements">
      <h3>Wymagania dzienne</h3>
      <div class="daily-stats">
        <div class="daily-stat">
          <div class="daily-label">Do końca miesiąca</div>
          <div class="daily-value">{{ formatTime(dailyRequirements.monthlyRequirement) }}</div>
          <div class="daily-help">dziennie aby osiągnąć 50h w tym miesiącu</div>
        </div>
        <div class="daily-stat">
          <div class="daily-label">Do końca roku służbowego</div>
          <div class="daily-value">{{ formatTime(dailyRequirements.yearlyRequirement) }}</div>
          <div class="daily-help">dziennie aby osiągnąć cel roczny</div>
        </div>
      </div>
    </div>

    <div class="progress-section">
      <h3>Postęp w roku służbowym</h3>
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          [style.width.%]="Math.min(goalProgress, 100)">
        </div>
      </div>
      <div class="progress-info">
        <span>{{ formatTime(currentYearCountable) }} z {{ formatTime(yearlyGoal) }}</span>
      </div>
    </div>

    <div class="monthly-breakdown">
      <h3>Podział miesięczny</h3>
      <div class="monthly-stats-info">
        <div class="legend">
          <div class="legend-item">
            <div class="legend-color service"></div>
            <span>Służba</span>
          </div>
          <div class="legend-item">
            <div class="legend-color other"></div>
            <span>Inne (max 55h)</span>
          </div>
          <div class="legend-item">
            <div class="legend-color over-limit"></div>
            <span>Ponad limit</span>
          </div>
        </div>
      </div>
      <div class="monthly-chart">
        <div 
          *ngFor="let monthData of monthlyData" 
          class="month-bar">
          <div class="month-fills">
            <div 
              *ngIf="monthData.serviceHours > 0"
              class="month-fill service" 
              [style.height.%]="getMonthFillHeight(monthData.serviceHours)">
            </div>
            <div 
              *ngIf="monthData.otherHours > 0"
              class="month-fill other" 
              [style.height.%]="getMonthFillHeight(Math.min(monthData.otherHours, 55))">
            </div>
            <div 
              *ngIf="monthData.overLimitHours > 0"
              class="month-fill over-limit" 
              [style.height.%]="getMonthFillHeight(monthData.overLimitHours)">
            </div>
          </div>
          <div class="month-label">{{ monthData.name }}</div>
          <div 
            *ngIf="monthData.countableHours > 0" 
            class="month-value">
            {{ formatTime(monthData.countableHours) }}
          </div>
        </div>
      </div>
    </div>
  `
})
export class StatisticsComponent implements OnInit {
  serviceYear = 0;
  currentMonthHours: MonthlyData = {
    totalHours: 0,
    serviceHours: 0,
    otherHours: 0,
    overLimitHours: 0,
    countableHours: 0
  };
  currentYearCountable = 0;
  goalProgress = 0;
  hoursToGoal = 0;
  yearlyGoal = 600;
  dailyRequirements = {
    monthlyRequirement: 0,
    yearlyRequirement: 0,
    daysRemainingInMonth: 0,
    daysRemainingInYear: 0
  };
  monthlyData: any[] = [];
  Math = Math;

  private entries: ServiceEntry[] = [];
  private settings: Settings | null = null;

  constructor(private pioneerService: PioneerTimerService) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.pioneerService.entries$.subscribe(entries => {
      this.entries = entries;
      this.updateStatistics();
    });

    this.pioneerService.settings$.subscribe(settings => {
      this.settings = settings;
      if (settings) {
        this.yearlyGoal = settings.yearlyGoal;
      }
      this.updateStatistics();
    });
  }

  private updateStatistics(): void {
    if (!this.entries || !this.settings) return;

    const today = new Date();
    this.serviceYear = this.pioneerService.getServiceYear(today);
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Current month hours
    this.currentMonthHours = this.pioneerService.getMonthHours(currentYear, currentMonth, this.entries);

    // Current service year hours
    this.currentYearCountable = this.pioneerService.calculateYearlyCountableHours(this.serviceYear, this.entries);

    // Goal progress
    this.goalProgress = (this.currentYearCountable / this.yearlyGoal) * 100;
    this.hoursToGoal = Math.max(0, this.yearlyGoal - this.currentYearCountable);

    // Daily requirements
    this.dailyRequirements = this.pioneerService.getDailyRequirements(
      this.serviceYear, 
      this.currentMonthHours.countableHours, 
      this.currentYearCountable
    );

    // Monthly chart data
    this.updateMonthlyChart();
  }

  private updateMonthlyChart(): void {
    const months = [
      'Wrz', 'Paź', 'Lis', 'Gru', 'Sty', 'Lut',
      'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie'
    ];

    this.monthlyData = months.map((monthName, index) => {
      let year: number, month: number;
      
      if (index < 4) { // Sept-Dec
        year = this.serviceYear;
        month = index + 8;
      } else { // Jan-Aug
        year = this.serviceYear + 1;
        month = index - 4;
      }
      
      const data = this.pioneerService.getMonthHours(year, month, this.entries);
      return { 
        name: monthName, 
        ...data,
        displayMonth: month,
        displayYear: year
      };
    });
  }

  getMonthFillHeight(hours: number): number {
    const maxHours = Math.max(...this.monthlyData.map(d => d.totalHours), 60);
    return maxHours > 0 ? (hours / maxHours) * 100 : 0;
  }

  getMonthBreakdownText(monthData: MonthlyData): string {
    const parts: string[] = [];
    if (monthData.serviceHours > 0) {
      parts.push(`Służba: ${this.formatTime(monthData.serviceHours)}`);
    }
    if (monthData.otherHours > 0) {
      parts.push(`Inne: ${this.formatTime(monthData.otherHours)}`);
    }
    if (monthData.overLimitHours > 0) {
      parts.push(`Ponad limit: ${this.formatTime(monthData.overLimitHours)}`);
    }
    return parts.join(' | ');
  }

  getYearBreakdownText(): string {
    if (!this.settings) return '';
    
    const yearData = this.pioneerService.getServiceYearHours(this.serviceYear, this.entries);
    const typeBreakdown: string[] = [];
    
    Object.entries(yearData.breakdown).forEach(([typeId, hours]) => {
      const typeName = this.pioneerService.getHourTypeName(typeId);
      typeBreakdown.push(`${typeName}: ${this.formatTime(hours)}`);
    });
    
    return typeBreakdown.join(' | ');
  }

  formatTime(decimal: number): string {
    return this.pioneerService.formatTime(decimal);
  }
}
