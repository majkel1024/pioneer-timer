import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HourType } from '../../../models';

@Component({
  selector: 'app-hour-type-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="hour-type-selector">
      <label for="hour-type">Typ godzin:</label>
      <select 
        id="hour-type" 
        name="hour-type"
        [value]="selectedType"
        (change)="onTypeChange($event)">
        <option 
          *ngFor="let hourType of hourTypes" 
          [value]="hourType.id">
          {{ hourType.name }}
        </option>
      </select>
    </div>
  `
})
export class HourTypeSelectorComponent {
  @Input() hourTypes: HourType[] = [];
  @Input() selectedType: string = '';
  @Output() typeChange = new EventEmitter<string>();

  onTypeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.typeChange.emit(target.value);
  }
}
