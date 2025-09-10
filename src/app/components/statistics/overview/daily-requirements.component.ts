import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PioneerTimerService } from '../../../services/pioneer-timer.service';

export interface DailyRequirements {
  monthlyRequirement: number;
  yearlyRequirement: number;
  daysRemainingInMonth: number;
  daysRemainingInYear: number;
}

@Component({
  selector: 'app-daily-requirements',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="daily-requirements">
      <h3>Wymagania dzienne</h3>
      <div class="daily-stats">
        <div class="daily-stat">
          <div class="daily-label">Do końca miesiąca</div>
          <div class="daily-value">{{ formatTime(requirements.monthlyRequirement) }}</div>
          <div class="daily-help">dziennie aby osiągnąć 50h w tym miesiącu</div>
        </div>
        <div class="daily-stat">
          <div class="daily-label">Do końca roku służbowego</div>
          <div class="daily-value">{{ formatTime(requirements.yearlyRequirement) }}</div>
          <div class="daily-help">dziennie aby osiągnąć cel roczny</div>
        </div>
      </div>
    </div>
  `
})
export class DailyRequirementsComponent {
  @Input() requirements: DailyRequirements = {
    monthlyRequirement: 0,
    yearlyRequirement: 0,
    daysRemainingInMonth: 0,
    daysRemainingInYear: 0
  };

  constructor(private pioneerService: PioneerTimerService) {}

  formatTime(decimal: number): string {
    return this.pioneerService.formatTime(decimal);
  }
}
