import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TimeValue {
  hours: number;
  minutes: number;
}

@Component({
  selector: 'app-time-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="hours-input">
      <label for="service-hours">Liczba godzin:</label>
      <div class="time-input-container">
        <input 
          type="time" 
          id="time-input" 
          class="time-picker"
          [value]="getTimeString()"
          (input)="onTimeChange($event)"
          step="900">
      </div>
      <div class="time-help">Wprowadź godziny i minuty</div>
    </div>
  `
})
export class TimeInputComponent {
  @Input() timeValue: TimeValue = { hours: 0, minutes: 0 };
  @Output() timeChange = new EventEmitter<TimeValue>();

  onTimeChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const timeString = target.value; // Format "HH:MM"
    
    if (timeString) {
      const [hoursStr, minutesStr] = timeString.split(':');
      const hours = parseInt(hoursStr, 10) || 0;
      const minutes = parseInt(minutesStr, 10) || 0;
      this.timeChange.emit({ hours, minutes });
    }
  }

  getTimeString(): string {
    const hours = this.timeValue.hours.toString().padStart(2, '0');
    const minutes = this.timeValue.minutes.toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
