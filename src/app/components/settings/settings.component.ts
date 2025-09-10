import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PioneerTimerService } from '../../services/pioneer-timer.service';
import { Settings, HourType } from '../../models';
import { YearlyGoalSettingComponent } from './goals/yearly-goal-setting.component';
import { HourTypesManagerComponent } from './hour-types/hour-types-manager.component';
import { DataManagementComponent } from './data/data-management.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, 
    YearlyGoalSettingComponent,
    HourTypesManagerComponent,
    DataManagementComponent
  ],
  template: `
    <h2>Ustawienia</h2>
    
    <div class="settings-section">
      <div class="section-header">
        <h3>💡 Pomoc</h3>
        <p>Informacje o tym jak działa aplikacja</p>
      </div>
      <button class="secondary-btn help-btn" (click)="showHelpModal()">
        📖 Jak działa aplikacja?
      </button>
    </div>
    
    <app-yearly-goal-setting
      [yearlyGoal]="yearlyGoal"
      (goalChange)="onYearlyGoalChange($event)">
    </app-yearly-goal-setting>

    <app-hour-types-manager
      [hourTypes]="additionalHourTypes"
      (addHourType)="addHourType()"
      (removeHourType)="removeHourType($event)"
      (updateHourTypeName)="updateHourTypeName($event)">
    </app-hour-types-manager>

    <app-data-management
      (exportData)="exportData()"
      (importData)="importData($event)"
      (clearAllData)="clearAllData()">
    </app-data-management>
  `,
  styles: [`
    .settings-section {
      background: rgba(255, 255, 255, 0.3);
      border-radius: var(--radius-md);
      padding: var(--spacing-lg);
      margin-bottom: var(--spacing-lg);
      border: 1px solid var(--sage-green-light);
    }

    .section-header h3 {
      margin: 0 0 var(--spacing-xs) 0;
      color: var(--primary-green-dark);
      font-size: var(--font-size-lg);
    }

    .section-header p {
      margin: 0 0 var(--spacing-md) 0;
      color: var(--eucalyptus-dark);
      font-size: var(--font-size-sm);
      opacity: 0.9;
    }

    .help-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--font-size-base);
    }

    .secondary-btn {
      background: var(--sage-green-light);
      color: var(--primary-green-dark);
      border: 1px solid var(--sage-green);
      padding: var(--spacing-sm) var(--spacing-lg);
      border-radius: var(--radius-md);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition: var(--transition-fast);
    }

    .secondary-btn:hover {
      background: var(--sage-green);
      transform: translateY(-1px);
    }
  `]
})
export class SettingsComponent implements OnInit {
  private pioneerService = inject(PioneerTimerService);

  @Output() showHelp = new EventEmitter<void>();
  
  yearlyGoal = 600;
  additionalHourTypes: HourType[] = [];
  isExporting = false;
  
  private settings: Settings | null = null;

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

  onYearlyGoalChange(goal: number): void {
    this.yearlyGoal = goal;
    this.updateYearlyGoal();
  }

  async updateHourTypeName(data: { hourType: HourType, name: string }): Promise<void> {
    if (data.name.trim() === '') {
      this.showMessage('Nazwa typu godzin nie może być pusta.', 'error');
      return;
    }
    data.hourType.name = data.name.trim();
    await this.saveHourTypes();
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
    } catch {
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
    } catch {
      this.showMessage('Błąd podczas zapisywania typów godzin.', 'error');
    }
  }

  async exportData(): Promise<void> {
    this.isExporting = true;
    try {
      await this.pioneerService.exportData();
      this.showMessage('Dane zostały wyeksportowane.', 'success');
    } catch {
      this.showMessage('Błąd podczas eksportowania danych.', 'error');
    } finally {
      this.isExporting = false;
    }
  }

  async importData(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    if (confirm('Czy na pewno chcesz zaimportować dane? To zastąpi wszystkie istniejące dane.')) {
      try {
        await this.pioneerService.importData(file);
        this.showMessage('Dane zostały zaimportowane pomyślnie!', 'success');
      } catch {
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
        } catch {
          this.showMessage('Błąd podczas usuwania danych.', 'error');
        }
      }
    }
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    // This would typically emit an event to the parent component
    console.log(`${type}: ${message}`);
  }

  showHelpModal(): void {
    this.showHelp.emit();
  }
}
