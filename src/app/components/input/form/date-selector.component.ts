import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="date-selector">
      <label for="service-date">Wybierz datę:</label>
      <input 
        type="date" 
        id="service-date" 
        name="service-date"
        [value]="selectedDate"
        (change)="onDateChange($event)">
    </div>
  `
})
export class DateSelectorComponent {
  @Input() selectedDate = '';
  @Output() dateChange = new EventEmitter<string>();

  onDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.dateChange.emit(target.value);
  }
}
