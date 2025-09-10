import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PioneerTimerService } from '../../../services/pioneer-timer.service';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
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
  `
})
export class ProgressBarComponent {
  @Input() goalProgress: number = 0;
  @Input() currentYearCountable: number = 0;
  @Input() yearlyGoal: number = 600;

  Math = Math;

  constructor(private pioneerService: PioneerTimerService) {}

  formatTime(decimal: number): string {
    return this.pioneerService.formatTime(decimal);
  }
}
