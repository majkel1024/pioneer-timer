import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PioneerTimerService } from '../../../services/pioneer-timer.service';

export interface MonthlyChartData {
  name: string;
  serviceHours: number;
  otherHours: number;
  overLimitHours: number;
  countableHours: number;
  totalHours: number;
}

@Component({
  selector: 'app-monthly-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
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
          *ngFor="let monthData of data" 
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
export class MonthlyChartComponent {
  @Input() data: MonthlyChartData[] = [];

  Math = Math;

  constructor(private pioneerService: PioneerTimerService) {}

  formatTime(decimal: number): string {
    return this.pioneerService.formatTime(decimal);
  }

  getMonthFillHeight(hours: number): number {
    const maxHours = Math.max(...this.data.map(d => d.totalHours), 60);
    return maxHours > 0 ? (hours / maxHours) * 100 : 0;
  }
}
