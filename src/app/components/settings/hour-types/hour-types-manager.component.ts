import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HourType } from '../../../models';

@Component({
  selector: 'app-hour-types-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="hour-types-section">
      <h3>Typy godzin</h3>
      <div class="setting-help" style="margin-bottom: 20px;">
        Służba: bez limitów. Inne typy + służba razem: max 55h/miesiąc do statystyk (służba ma pierwszeństwo).
      </div>
      
      <div class="hour-type-item">
        <input 
          type="text" 
          value="Służba" 
          disabled 
          class="hour-type-name">
        <span class="hour-type-info">Bez limitu</span>
      </div>
      
      <div *ngFor="let hourType of hourTypes; let i = index" class="hour-type-item">
        <input 
          type="text" 
          [value]="hourType.name"
          (change)="onNameChange(hourType, $event)"
          class="hour-type-name">
        <span class="hour-type-info">+ służba max 55h/m</span>
        <button 
          class="delete-btn" 
          (click)="onRemove(hourType)">
          Usuń
        </button>
      </div>
      
      <button 
        class="secondary-btn" 
        (click)="onAdd()"
        [disabled]="hourTypes.length >= 5">
        Dodaj typ godzin
      </button>
    </div>
  `
})
export class HourTypesManagerComponent {
  @Input() hourTypes: HourType[] = [];
  @Output() addHourType = new EventEmitter<void>();
  @Output() removeHourType = new EventEmitter<HourType>();
  @Output() updateHourTypeName = new EventEmitter<{ hourType: HourType, name: string }>();

  onAdd(): void {
    this.addHourType.emit();
  }

  onRemove(hourType: HourType): void {
    this.removeHourType.emit(hourType);
  }

  onNameChange(hourType: HourType, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateHourTypeName.emit({ hourType, name: target.value });
  }
}
