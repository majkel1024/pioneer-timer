import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DatabaseService } from './database.service';
import { ServiceEntry, Settings, MonthlyData, ServiceYearData, DailyRequirement } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PioneerTimerService {
  private db = inject(DatabaseService);

  private settingsSubject = new BehaviorSubject<Settings | null>(null);
  private entriesSubject = new BehaviorSubject<ServiceEntry[]>([]);

  public settings$ = this.settingsSubject.asObservable();
  public entries$ = this.entriesSubject.asObservable();

  constructor() {
    this.loadInitialData();
  }

  private async loadInitialData(): Promise<void> {
    try {
      const settings = await this.db.getSettings();
      this.settingsSubject.next(settings);
      
      const entries = await this.db.getAllEntries();
      this.entriesSubject.next(entries);
    } catch (error) {
      console.error('Błąd podczas ładowania danych:', error);
    }
  }

  // Service year calculations (September 1st to August 31st)
  getServiceYear(date: Date = new Date()): number {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-based
    
    // If month is September (8) or later, service year is current year
    // If month is before September, service year is previous year
    return month >= 8 ? year : year - 1;
  }

  getServiceYearPeriod(serviceYear: number): { start: Date; end: Date } {
    return {
      start: new Date(serviceYear, 8, 1), // September 1st
      end: new Date(serviceYear + 1, 7, 31) // August 31st next year
    };
  }

  isDateInServiceYear(date: Date, serviceYear: number): boolean {
    const period = this.getServiceYearPeriod(serviceYear);
    return date >= period.start && date <= period.end;
  }

  // Time conversion utilities
  hoursToDecimal(hours: number, minutes: number): number {
    return hours + (minutes / 60);
  }

  decimalToHours(decimal: number): { hours: number; minutes: number } {
    const hours = Math.floor(decimal);
    const minutes = Math.round((decimal - hours) * 60);
    return { hours, minutes };
  }

  formatTime(decimal: number): string {
    const { hours, minutes } = this.decimalToHours(decimal);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    };
    return date.toLocaleDateString('pl-PL', options);
  }

  // Entry management
  async saveEntry(entry: ServiceEntry): Promise<void> {
    try {
      await this.db.upsertEntry(entry);
      const entries = await this.db.getAllEntries();
      this.entriesSubject.next(entries);
    } catch (error) {
      console.error('Błąd podczas zapisywania wpisu:', error);
      throw error;
    }
  }

  async deleteEntry(id: number): Promise<void> {
    try {
      await this.db.deleteEntry(id);
      const entries = await this.db.getAllEntries();
      this.entriesSubject.next(entries);
    } catch (error) {
      console.error('Błąd podczas usuwania wpisu:', error);
      throw error;
    }
  }

  async getEntryByDate(date: string): Promise<ServiceEntry | undefined> {
    return await this.db.getEntryByDate(date);
  }

  // Settings management
  async updateSettings(settings: Settings): Promise<void> {
    try {
      await this.db.updateSettings(settings);
      this.settingsSubject.next(settings);
    } catch (error) {
      console.error('Błąd podczas zapisywania ustawień:', error);
      throw error;
    }
  }

  getHourTypeName(typeId: string): string {
    const settings = this.settingsSubject.value;
    if (!settings) return 'Nieznany';
    
    const type = settings.hourTypes.find(t => t.id === typeId);
    return type ? type.name : 'Nieznany';
  }

  // Statistics calculations
  getServiceYearHours(serviceYear: number, entries: ServiceEntry[], typeFilter?: string): ServiceYearData {
    let totalHours = 0;
    const breakdown: Record<string, number> = {};

    entries.forEach(entry => {
      const date = new Date(entry.date);
      if (this.isDateInServiceYear(date, serviceYear)) {
        if (!typeFilter || entry.type === typeFilter) {
          totalHours += entry.hours;
          
          const type = entry.type || 'service';
          if (!breakdown[type]) breakdown[type] = 0;
          breakdown[type] += entry.hours;
        }
      }
    });

    return { totalHours, breakdown };
  }

  getMonthHours(year: number, month: number, entries: ServiceEntry[], typeFilter?: string): MonthlyData {
    let totalHours = 0;
    let serviceHours = 0;
    let otherHours = 0;
    let overLimitHours = 0;

    entries.forEach(entry => {
      const date = new Date(entry.date);
      if (date.getFullYear() === year && date.getMonth() === month) {
        if (!typeFilter || entry.type === typeFilter) {
          const entryType = entry.type || 'service';
          
          if (entryType === 'service') {
            serviceHours += entry.hours;
          } else {
            otherHours += entry.hours;
          }
          totalHours += entry.hours;
        }
      }
    });

    // Oblicz godziny liczące się do statystyk zgodnie z zasadami:
    // 1. Godziny służby zawsze się liczą (bez limitów)
    // 2. Inne typy + służba razem maksymalnie 55h
    // 3. Jeśli służba > 55h, to tylko służba się liczy
    // 4. Jeśli służba <= 55h, to służba + inne (do limitu 55h razem)
    
    let countableHours = serviceHours; // Służba zawsze się liczy
    let countableOtherHours = 0;
    
    if (serviceHours < 55) {
      // Służba nie przekracza 55h, więc można dodać inne typy do limitu 55h
      const remainingLimit = 55 - serviceHours;
      countableOtherHours = Math.min(otherHours, remainingLimit);
      countableHours = serviceHours + countableOtherHours;
    }
    // Jeśli służba >= 55h, countableHours = serviceHours (bez innych typów)
    
    // Godziny przekraczające limit to te "inne", które się nie liczyły
    overLimitHours = otherHours - countableOtherHours;

    return { 
      totalHours, 
      serviceHours, 
      otherHours, 
      overLimitHours, 
      countableHours 
    };
  }

  calculateYearlyCountableHours(serviceYear: number, entries: ServiceEntry[]): number {
    let totalCountable = 0;

    // Group by month in service year and calculate countable hours for each month
    for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
      let year: number, month: number;
      
      if (monthOffset < 4) { // Sept-Dec of service year
        year = serviceYear;
        month = monthOffset + 8; // Sept=8, Oct=9, Nov=10, Dec=11
      } else { // Jan-Aug of next year
        year = serviceYear + 1;
        month = monthOffset - 4; // Jan=0, Feb=1, ..., Aug=7
      }

      const monthData = this.getMonthHours(year, month, entries);
      totalCountable += monthData.countableHours;
    }

    return totalCountable;
  }

  getMonthBreakdown(year: number, month: number, entries: ServiceEntry[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.date);
      if (date.getFullYear() === year && date.getMonth() === month) {
        const typeId = entry.type || 'service';
        breakdown[typeId] = (breakdown[typeId] || 0) + entry.hours;
      }
    });
    
    return breakdown;
  }

  getDailyRequirements(serviceYear: number, currentMonthCountable: number, currentYearCountable: number): DailyRequirement {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDate = today.getDate();
    
    // Days remaining in current month
    const daysInMonth = new Date(today.getFullYear(), currentMonth + 1, 0).getDate();
    const daysRemainingInMonth = daysInMonth - currentDate + 1;
    
    // Monthly requirement (to reach 50h)
    const monthlyGoal = 50;
    const monthlyRemaining = Math.max(0, monthlyGoal - currentMonthCountable);
    const monthlyRequirement = daysRemainingInMonth > 0 ? monthlyRemaining / daysRemainingInMonth : 0;
    
    // Yearly requirement
    const period = this.getServiceYearPeriod(serviceYear);
    const daysRemainingInYear = Math.ceil((period.end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const settings = this.settingsSubject.value;
    const yearlyGoal = settings?.yearlyGoal || 600;
    const yearlyRemaining = Math.max(0, yearlyGoal - currentYearCountable);
    const yearlyRequirement = daysRemainingInYear > 0 ? yearlyRemaining / daysRemainingInYear : 0;
    
    return {
      monthlyRequirement,
      yearlyRequirement,
      daysRemainingInMonth,
      daysRemainingInYear
    };
  }

  // Data management
  /**
   * Zwraca nazwę pliku i blob z eksportem danych (bez wywoływania pobrania)
   * Pozwala to na przesłanie danych gdzie indziej (np. na Dysk Google).
   */
  async getExportBlob(): Promise<{ fileName: string; blob: Blob }> {
    try {
      const data = await this.db.exportData();
      const exportData = {
        ...data,
        exportDate: new Date().toISOString(),
        version: '2.0'
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const fileName = `pioneer-timer-backup-${new Date().toISOString().split('T')[0]}.json`;
      return { fileName, blob };
    } catch (error) {
      console.error('Błąd podczas tworzenia eksportu danych:', error);
      throw error;
    }
  }

  async exportData(): Promise<void> {
    // backward-compatible: trigger local download using the new helper
    const { fileName, blob } = await this.getExportBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async importData(file: File): Promise<void> {
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      if (importData.entries && importData.settings) {
        await this.db.importData(importData);
        await this.loadInitialData();
      } else {
        throw new Error('Nieprawidłowy format pliku');
      }
    } catch (error) {
      console.error('Błąd podczas importowania danych:', error);
      throw error;
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await this.db.clearAllData();
      const entries = await this.db.getAllEntries();
      this.entriesSubject.next(entries);
    } catch (error) {
      console.error('Błąd podczas usuwania danych:', error);
      throw error;
    }
  }
}
