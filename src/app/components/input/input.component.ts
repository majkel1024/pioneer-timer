import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PioneerTimerService } from '../../services/pioneer-timer.service';
import { FormStateService, FormState } from '../../services/form-state.service';
import { ToastService } from '../../services/toast.service';
import { ServiceEntry, HourType } from '../../models';
import { DateSelectorComponent } from './form/date-selector.component';
import { HourTypeSelectorComponent } from './form/hour-type-selector.component';
import { TimeInputComponent, TimeValue } from './form/time-input.component';
import { NotesInputComponent } from './form/notes-input.component';
import { RecentEntriesListComponent } from './entries/recent-entries-list.component';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [
    CommonModule, 
    DateSelectorComponent,
    HourTypeSelectorComponent, 
    TimeInputComponent,
    NotesInputComponent,
    RecentEntriesListComponent
  ],
  template: `
    <h2>Wprowadzanie godzin</h2>
    
    <div class="input-section">
      <app-date-selector
        [selectedDate]="formData.date"
        (dateChange)="onDateChange($event)">
      </app-date-selector>
      
      <app-hour-type-selector
        [hourTypes]="hourTypes"
        [selectedType]="formData.type"
        (typeChange)="onTypeChange($event)">
      </app-hour-type-selector>
      
      <app-time-input
        [timeValue]="{ hours: formData.hours, minutes: formData.minutes }"
        (timeChange)="onTimeChange($event)">
      </app-time-input>
      
      <app-notes-input
        [notes]="formData.notes"
        (notesChange)="onNotesChange($event)">
      </app-notes-input>
      
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

    <app-recent-entries-list
      [entries]="recentEntries"
      (editEntry)="editEntry($event)"
      (deleteEntry)="deleteEntry($event)">
    </app-recent-entries-list>
  `
})
export class InputComponent implements OnInit {
  private pioneerService = inject(PioneerTimerService);
  private formStateService = inject(FormStateService);
  private toastService = inject(ToastService);

  formData: FormState = {
    date: '',
    type: 'service',
    hours: 0,
    minutes: 0,
    notes: '',
    isDirty: false,
    editingEntryId: undefined
  };

  hourTypes: HourType[] = [];
  recentEntries: ServiceEntry[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.loadSettings();
    this.loadRecentEntries();
    
    // Subskrypcja na stan formularza
    this.formStateService.formState$.subscribe(state => {
      this.formData = state;
    });
    
    // Załaduj istniejący wpis dla aktualnej daty jeśli formularz nie jest "brudny"
    if (!this.formStateService.isDirty() && this.formData.date) {
      this.loadEntryForDate();
    }
  }

  onDateChange(date: string): void {
    this.formStateService.updateDate(date);
    
    // Załaduj istniejący wpis dla nowej daty tylko jeśli formularz nie ma niezapisanych zmian
    if (!this.formStateService.isDirty()) {
      this.loadEntryForDate();
    }
  }

  onTypeChange(type: string): void {
    this.formStateService.updateState({ type });
  }

  onTimeChange(timeValue: TimeValue): void {
    this.formStateService.updateState({ 
      hours: timeValue.hours, 
      minutes: timeValue.minutes 
    });
  }

  onNotesChange(notes: string): void {
    this.formStateService.updateState({ notes });
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
    // Nie ładujemy już automatycznie wpisów - pozwalamy na wiele wpisów na dzień
    // Ta metoda zostaje dla kompatybilności, ale nie robi nic
    return;
  }

  async saveEntry(): Promise<void> {
    if (!this.formData.date) {
      this.toastService.error('Proszę wybrać datę.');
      return;
    }

    if (this.formData.hours < 0 || this.formData.hours > 23) {
      this.toastService.error('Godziny muszą być w zakresie 0-23.');
      return;
    }

    if (this.formData.hours === 0 && this.formData.minutes === 0) {
      this.toastService.warning('Proszę wprowadzić czas większy niż 0.');
      return;
    }

    this.isLoading = true;
    
    try {
      const totalHours = this.pioneerService.hoursToDecimal(this.formData.hours, this.formData.minutes);
      
      // Zawsze tworzymy nowy wpis (pozwalamy na wiele wpisów dziennie)
      const entry: ServiceEntry = {
        date: this.formData.date,
        hours: totalHours,
        type: this.formData.type,
        notes: this.formData.notes,
        timestamp: new Date().getTime()
      };

      if (this.formData.editingEntryId) {
        entry.id = this.formData.editingEntryId;
      }
      
      await this.pioneerService.saveEntry(entry);
      
      // Po zapisie czyścimy formularz (zachowujemy datę i typ)
      this.formStateService.updateState({
        hours: 0,
        minutes: 0,
        notes: '',
        editingEntryId: undefined // Czyścimy ID edycji
      });
      this.formStateService.markAsClean();
      
      const timeStr = this.pioneerService.formatTime(totalHours);
      const typeStr = this.pioneerService.getHourTypeName(this.formData.type);
      this.toastService.success(`Zapisano ${timeStr} (${typeStr}) na dzień ${this.formatDisplayDate(this.formData.date)}`);
      
    } catch (error) {
      this.toastService.error('Błąd podczas zapisywania wpisu.');
      console.error('Save error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  clearForm(): void {
    this.formStateService.clearForm();
  }

  editEntry(entry: ServiceEntry): void {
    // Załaduj dane z wpisu do edycji
    const { hours, minutes } = this.pioneerService.decimalToHours(entry.hours);
    this.formStateService.updateState({
      date: entry.date,
      hours,
      minutes,
      type: entry.type || 'service',
      notes: entry.notes || '',
      editingEntryId: entry.id // Dodajemy ID edytowanego wpisu
    });
    this.formStateService.markAsClean();
    
    // Usuń stary wpis - będzie zastąpiony nowym po zapisie
    this.deleteEntry(entry);
  }

  formatDisplayDate(dateString: string): string {
    return this.pioneerService.formatDate(dateString);
  }

  async deleteEntry(entry: ServiceEntry): Promise<void> {
    try {
      await this.pioneerService.deleteEntry(entry.id!);
      this.toastService.success('Wpis został usunięty.');
    } catch (error) {
      this.toastService.error('Błąd podczas usuwania wpisu.');
      console.error('Delete error:', error);
    }
  }
}
