import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PioneerTimerService } from '../services/pioneer-timer.service';
import { Settings, HourType } from '../models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Ustawienia</h2>
    
    <div class="settings-section">
      <div class="setting-item">
        <label for="yearly-goal">Cel godzinowy na rok służbowy:</label>
        <input 
          type="number" 
          id="yearly-goal" 
          min="1" 
          max="9999" 
          [(ngModel)]="yearlyGoal"
          (change)="updateYearlyGoal()">
        <span class="setting-help">Cel na rok służbowy (01 września - 31 sierpnia)</span>
      </div>
    </div>

    <div class="hour-types-section">
      <h3>Typy godzin</h3>
      <div class="setting-help" style="margin-bottom: 20px;">
        Pierwszy typ to zawsze "Służba" (bez limitu miesięcznego). Inne typy mają limit 55h/miesiąc.
      </div>
      
      <div class="hour-type-item">
        <input 
          type="text" 
          value="Służba" 
          disabled 
          class="hour-type-name">
        <span class="hour-type-info">Bez limitu</span>
      </div>
      
      <div *ngFor="let hourType of additionalHourTypes; let i = index" class="hour-type-item">
        <input 
          type="text" 
          [(ngModel)]="hourType.name"
          (change)="updateHourTypeName(hourType)"
          class="hour-type-name">
        <span class="hour-type-info">Limit 55h/miesiąc</span>
        <button 
          class="delete-btn" 
          (click)="removeHourType(hourType)">
          Usuń
        </button>
      </div>
      
      <button 
        class="secondary-btn" 
        (click)="addHourType()"
        [disabled]="additionalHourTypes.length >= 5">
        Dodaj typ godzin
      </button>
    </div>

    <div class="data-management">
      <h3>Zarządzanie danymi</h3>
      <div class="actions">
        <button 
          class="secondary-btn" 
          (click)="exportData()"
          [disabled]="isExporting">
          {{ isExporting ? 'Eksportowanie...' : 'Eksportuj dane' }}
        </button>
        <button 
          class="secondary-btn" 
          (click)="triggerImport()">
          Importuj dane
        </button>
        <button 
          class="danger-btn" 
          (click)="clearAllData()">
          Wyczyść wszystkie dane
        </button>
      </div>
      <input 
        type="file" 
        #fileInput
        accept=".json" 
        style="display: none;"
        (change)="importData($event)">
    </div>
  `
})
export class SettingsComponent implements OnInit {
  yearlyGoal = 600;
  additionalHourTypes: HourType[] = [];
  isExporting = false;
  
  private settings: Settings | null = null;

  constructor(private pioneerService: PioneerTimerService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    this.pioneerService.settings$.subscribe(settings => {
      if (settings) {
        this.settings = settings;
        this.yearlyGoal = settings.yearlyGoal;
        this.additionalHourTypes = settings.hourTypes.slice(1); // Skip the first "Służba" type
      }
    });
  }

  async updateYearlyGoal(): Promise<void> {
    if (!this.settings) return;

    try {
      const updatedSettings: Settings = {
        ...this.settings,
        yearlyGoal: this.yearlyGoal
      };
      await this.pioneerService.updateSettings(updatedSettings);
      this.showMessage('Cel godzinowy został zaktualizowany.', 'success');
    } catch (error) {
      this.showMessage('Błąd podczas zapisywania ustawień.', 'error');
    }
  }

  addHourType(): void {
    if (this.additionalHourTypes.length >= 5) {
      this.showMessage('Można dodać maksymalnie 5 dodatkowych typów godzin.', 'error');
      return;
    }

    const name = prompt('Podaj nazwę nowego typu godzin:');
    if (!name || name.trim() === '') return;

    const newHourType: HourType = {
      id: 'type_' + Date.now(),
      name: name.trim(),
      hasLimit: true
    };

    this.additionalHourTypes.push(newHourType);
    this.saveHourTypes();
  }

  async removeHourType(hourType: HourType): Promise<void> {
    if (confirm('Czy na pewno chcesz usunąć ten typ godzin? Wszystkie wpisy tego typu zostaną usunięte.')) {
      this.additionalHourTypes = this.additionalHourTypes.filter(ht => ht.id !== hourType.id);
      await this.saveHourTypes();
      this.showMessage('Typ godzin został usunięty.', 'success');
    }
  }

  async updateHourTypeName(hourType: HourType): Promise<void> {
    if (hourType.name.trim() === '') {
      this.showMessage('Nazwa typu godzin nie może być pusta.', 'error');
      return;
    }
    await this.saveHourTypes();
  }

  private async saveHourTypes(): Promise<void> {
    if (!this.settings) return;

    try {
      const updatedSettings: Settings = {
        ...this.settings,
        hourTypes: [
          { id: 'service', name: 'Służba', hasLimit: false },
          ...this.additionalHourTypes
        ]
      };
      await this.pioneerService.updateSettings(updatedSettings);
    } catch (error) {
      this.showMessage('Błąd podczas zapisywania typów godzin.', 'error');
    }
  }

  async exportData(): Promise<void> {
    this.isExporting = true;
    try {
      await this.pioneerService.exportData();
      this.showMessage('Dane zostały wyeksportowane.', 'success');
    } catch (error) {
      this.showMessage('Błąd podczas eksportowania danych.', 'error');
    } finally {
      this.isExporting = false;
    }
  }

  triggerImport(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  async importData(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    if (confirm('Czy na pewno chcesz zaimportować dane? To zastąpi wszystkie istniejące dane.')) {
      try {
        await this.pioneerService.importData(file);
        this.showMessage('Dane zostały zaimportowane pomyślnie!', 'success');
      } catch (error) {
        this.showMessage('Błąd podczas importowania pliku.', 'error');
      }
    }

    // Clear the file input
    target.value = '';
  }

  async clearAllData(): Promise<void> {
    if (confirm('Czy na pewno chcesz usunąć wszystkie dane? Tej operacji nie można cofnąć.')) {
      if (confirm('To jest ostateczne ostrzeżenie. Wszystkie dane zostaną bezpowrotnie utracone. Kontynuować?')) {
        try {
          await this.pioneerService.clearAllData();
          this.showMessage('Wszystkie dane zostały usunięte.', 'success');
        } catch (error) {
          this.showMessage('Błąd podczas usuwania danych.', 'error');
        }
      }
    }
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    // This would typically emit an event to the parent component
    console.log(`${type}: ${message}`);
  }
}
