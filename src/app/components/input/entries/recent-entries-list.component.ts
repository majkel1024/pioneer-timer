import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceEntry } from '../../../models';
import { PioneerTimerService } from '../../../services/pioneer-timer.service';

@Component({
  selector: 'app-recent-entries-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="recent-entries">
      <div class="recent-entries-header">
        <h3>{{ getMonthYearLabel() }}</h3>
        <div class="month-navigation">
          <button 
            class="nav-btn" 
            (click)="previousMonth()"
            [disabled]="!hasPreviousMonth()">
            ←
          </button>
          <button 
            class="nav-btn" 
            (click)="nextMonth()"
            [disabled]="!hasNextMonth()">
            →
          </button>
        </div>
      </div>
      <div class="recent-entries-list">
        <div 
          *ngFor="let entry of filteredEntries" 
          class="entry-item">
          <div class="entry-info">
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
              (click)="onEdit(entry)">
              Edytuj
            </button>
            <button 
              class="delete-btn" 
              (click)="onDelete(entry)">
              Usuń
            </button>
          </div>
        </div>
        
        <p 
          *ngIf="filteredEntries.length === 0" 
          class="no-entries">
          Brak wpisów w tym miesiącu.
        </p>
      </div>
    </div>
  `
})
export class RecentEntriesListComponent implements OnInit, OnChanges {
  @Input() entries: ServiceEntry[] = [];
  @Output() editEntry = new EventEmitter<ServiceEntry>();
  @Output() deleteEntry = new EventEmitter<ServiceEntry>();

  currentDate = new Date();
  filteredEntries: ServiceEntry[] = [];

  constructor(private pioneerService: PioneerTimerService) {}

  ngOnInit(): void {
    this.filterEntriesForCurrentMonth();
  }

  ngOnChanges(): void {
    this.filterEntriesForCurrentMonth();
  }

  private filterEntriesForCurrentMonth(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    this.filteredEntries = this.entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === year && entryDate.getMonth() === month;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  previousMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.filterEntriesForCurrentMonth();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.filterEntriesForCurrentMonth();
  }

  hasPreviousMonth(): boolean {
    // Zawsze pozwalaj na cofnięcie się o miesiąc, chyba że jesteśmy już bardzo daleko w przeszłości
    const currentYear = this.currentDate.getFullYear();
    const currentMonth = this.currentDate.getMonth();
    
    // Ograniczenie do roku 2020 jako najwcześniejsza data
    const canGoPrevious = !(currentYear === 2020 && currentMonth === 0);
    console.log('hasPreviousMonth:', canGoPrevious, currentYear, currentMonth);
    return canGoPrevious;
  }

  hasNextMonth(): boolean {
    const today = new Date();
    const currentYear = this.currentDate.getFullYear();
    const currentMonth = this.currentDate.getMonth();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    
    // Nie można iść dalej niż bieżący miesiąc
    const canGoNext = !(currentYear === todayYear && currentMonth === todayMonth);
    console.log('hasNextMonth:', canGoNext, currentYear, currentMonth, 'vs', todayYear, todayMonth);
    return canGoNext;
  }

  getMonthYearLabel(): string {
    const monthNames = [
      'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
      'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
    ];
    
    const month = monthNames[this.currentDate.getMonth()];
    const year = this.currentDate.getFullYear();
    
    return `${month} ${year}`;
  }

  onEdit(entry: ServiceEntry): void {
    this.editEntry.emit(entry);
  }

  async onDelete(entry: ServiceEntry): Promise<void> {
    if (confirm('Czy na pewno chcesz usunąć ten wpis?') && entry.id) {
      this.deleteEntry.emit(entry);
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
}
