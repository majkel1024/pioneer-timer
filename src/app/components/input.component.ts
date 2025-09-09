import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PioneerTimerService } from '../services/pioneer-timer.service';
import { ServiceEntry, Settings } from '../models';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Wprowadzanie godzin</h2>
    
    <div class="input-section">
      <div class="date-selector">
        <label for="service-date">Wybierz datę:</label>
        <input 
          type="date" 
          id="service-date" 
          name="service-date"
          [(ngModel)]="formData.date"
          (change)="loadEntryForDate()">
      </div>
      
      <div class="hour-type-selector">
        <label for="hour-type">Typ godzin:</label>
        <select 
          id="hour-type" 
          name="hour-type"
          [(ngModel)]="formData.type">
          <option 
            *ngFor="let hourType of hourTypes" 
            [value]="hourType.id">
            {{ hourType.name }}
          </option>
        </select>
      </div>
      
      <div class="hours-input">
        <label for="service-hours">Liczba godzin:</label>
        <div class="time-input-container">
          <input 
            type="number" 
            id="hours-input" 
            min="0" 
            max="23" 
            placeholder="0" 
            class="time-part"
            [(ngModel)]="formData.hours">
          <span class="time-separator">:</span>
          <select 
            id="minutes-input" 
            class="time-part"
            [(ngModel)]="formData.minutes">
            <option value="0">00</option>
            <option value="15">15</option>
            <option value="30">30</option>
            <option value="45">45</option>
          </select>
        </div>
        <div class="time-help">Wprowadź godziny i minuty</div>
      </div>
      
      <div class="notes-input">
        <label for="service-notes">Notatki (opcjonalnie):</label>
        <textarea 
          id="service-notes" 
          name="service-notes" 
          rows="3" 
          placeholder="Dodatkowe informacje..."
          [(ngModel)]="formData.notes">
        </textarea>
      </div>
      
      <div class="actions">
        <button 
          class="primary-btn" 
          (click)="saveEntry()"
          [disabled]="isLoading">
          {{ isLoading ? 'Zapisywanie...' : 'Zapisz wpis' }}
        </button>
        <button 
          class="secondary-btn" 
          (click)="clearForm()">
          Wyczyść
        </button>
      </div>
    </div>

    <div class="recent-entries">
      <h3>Ostatnie wpisy</h3>
      <div class="recent-entries-list">
        <div 
          *ngFor="let entry of recentEntries" 
          class="entry-item">
          <div>
            <div class="entry-date">{{ formatDate(entry.date) }}</div>
            <div class="entry-type">{{ getHourTypeName(entry.type) }}</div>
            <div 
              *ngIf="entry.notes" 
              class="entry-notes">
              {{ entry.notes }}
            </div>
          </div>
          <div class="entry-hours">{{ formatTime(entry.hours) }}</div>
          <div class="entry-actions">
            <button 
              class="edit-btn" 
              (click)="editEntry(entry)">
              Edytuj
            </button>
            <button 
              class="delete-btn" 
              (click)="deleteEntry(entry)">
              Usuń
            </button>
          </div>
        </div>
        
        <p 
          *ngIf="recentEntries.length === 0" 
          class="no-entries">
          Brak wpisów do wyświetlenia.
        </p>
      </div>
    </div>
  `
})
export class InputComponent implements OnInit {
  formData = {
    date: '',
    type: 'service',
    hours: 0,
    minutes: 0,
    notes: ''
  };

  hourTypes: any[] = [];
  recentEntries: ServiceEntry[] = [];
  isLoading = false;

  constructor(private pioneerService: PioneerTimerService) {}

  ngOnInit(): void {
    this.setTodayDate();
    this.loadSettings();
    this.loadRecentEntries();
  }

  private setTodayDate(): void {
    const today = new Date().toISOString().split('T')[0];
    this.formData.date = today;
    this.loadEntryForDate();
  }

  private loadSettings(): void {
    this.pioneerService.settings$.subscribe(settings => {
      if (settings) {
        this.hourTypes = settings.hourTypes;
      }
    });
  }

  private loadRecentEntries(): void {
    this.pioneerService.entries$.subscribe(entries => {
      this.recentEntries = entries.slice(0, 10);
    });
  }

  async loadEntryForDate(): Promise<void> {
    if (!this.formData.date) return;

    const entry = await this.pioneerService.getEntryByDate(this.formData.date);
    if (entry) {
      const { hours, minutes } = this.pioneerService.decimalToHours(entry.hours);
      this.formData.hours = hours;
      this.formData.minutes = minutes;
      this.formData.type = entry.type || 'service';
      this.formData.notes = entry.notes || '';
    } else {
      this.formData.hours = 0;
      this.formData.minutes = 0;
      this.formData.type = 'service';
      this.formData.notes = '';
    }
  }

  async saveEntry(): Promise<void> {
    if (!this.formData.date) {
      this.showMessage('Proszę wybrać datę.', 'error');
      return;
    }

    if (this.formData.hours < 0 || this.formData.hours > 23) {
      this.showMessage('Godziny muszą być w zakresie 0-23.', 'error');
      return;
    }

    this.isLoading = true;
    
    try {
      const totalHours = this.pioneerService.hoursToDecimal(this.formData.hours, this.formData.minutes);
      
      const entry: ServiceEntry = {
        date: this.formData.date,
        hours: totalHours,
        type: this.formData.type,
        notes: this.formData.notes,
        timestamp: new Date().getTime()
      };

      await this.pioneerService.saveEntry(entry);
      this.showMessage('Wpis został zapisany pomyślnie!', 'success');
    } catch (error) {
      this.showMessage('Błąd podczas zapisywania wpisu.', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  clearForm(): void {
    this.formData.hours = 0;
    this.formData.minutes = 0;
    this.formData.type = 'service';
    this.formData.notes = '';
  }

  editEntry(entry: ServiceEntry): void {
    this.formData.date = entry.date;
    this.loadEntryForDate();
  }

  async deleteEntry(entry: ServiceEntry): Promise<void> {
    if (confirm('Czy na pewno chcesz usunąć ten wpis?') && entry.id) {
      try {
        await this.pioneerService.deleteEntry(entry.id);
        this.showMessage('Wpis został usunięty.', 'success');
      } catch (error) {
        this.showMessage('Błąd podczas usuwania wpisu.', 'error');
      }
    }
  }

  formatDate(dateString: string): string {
    return this.pioneerService.formatDate(dateString);
  }

  formatTime(hours: number): string {
    return this.pioneerService.formatTime(hours);
  }

  getHourTypeName(typeId: string): string {
    return this.pioneerService.getHourTypeName(typeId);
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    // This would typically emit an event to the parent component
    console.log(`${type}: ${message}`);
  }
}
