import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-yearly-goal-setting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-section">
      <div class="setting-item">
        <label for="yearly-goal">Cel godzinowy na rok służbowy:</label>
        <input 
          type="number" 
          id="yearly-goal" 
          min="1" 
          max="9999" 
          [value]="yearlyGoal"
          (change)="onGoalChange($event)">
        <span class="setting-help">Cel na rok służbowy (01 września - 31 sierpnia)</span>
      </div>
    </div>
  `
})
export class YearlyGoalSettingComponent {
  @Input() yearlyGoal: number = 600;
  @Output() goalChange = new EventEmitter<number>();

  onGoalChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value, 10);
    if (value > 0) {
      this.goalChange.emit(value);
    }
  }
}
