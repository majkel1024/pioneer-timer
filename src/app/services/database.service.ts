import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { ServiceEntry, Settings } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService extends Dexie {
  entries!: Table<ServiceEntry, number>;
  settings!: Table<Settings, number>;

  constructor() {
    super('PioneerTimerDB');
    
    this.version(1).stores({
      entries: '++id, date, hours, type, notes, timestamp',
      settings: '++id, yearlyGoal, hourTypes'
    });
  }

  async getAllEntries(): Promise<ServiceEntry[]> {
    return await this.entries.orderBy('date').reverse().toArray();
  }

  async getEntriesByDateRange(startDate: string, endDate: string): Promise<ServiceEntry[]> {
    return await this.entries
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();
  }

  async getEntryByDate(date: string): Promise<ServiceEntry | undefined> {
    return await this.entries.where('date').equals(date).first();
  }

  async addEntry(entry: ServiceEntry): Promise<number> {
    return await this.entries.add(entry);
  }

  async updateEntry(id: number, entry: Partial<ServiceEntry>): Promise<number> {
    const existingEntry = await this.entries.get(id);
    if (existingEntry) {
      const updatedEntry = { ...existingEntry, ...entry };
      await this.entries.put(updatedEntry);
      return id;
    }
    throw new Error('Entry not found');
  }

  async deleteEntry(id: number): Promise<void> {
    await this.entries.delete(id);
  }

  async upsertEntry(entry: ServiceEntry): Promise<number> {
    const existingEntry = await this.getEntryByDate(entry.date);
    if (existingEntry) {
      entry.id = existingEntry.id;
      await this.entries.put(entry);
      return existingEntry.id!;
    } else {
      return await this.addEntry(entry);
    }
  }

  async getSettings(): Promise<Settings> {
    const settings = await this.settings.toArray();
    if (settings.length === 0) {
      const defaultSettings: Settings = {
        yearlyGoal: 600,
        hourTypes: [
          { id: 'service', name: 'Służba', hasLimit: false }
        ]
      };
      await this.settings.add(defaultSettings);
      return defaultSettings;
    }
    return settings[0];
  }

  async updateSettings(settings: Settings): Promise<void> {
    const existingSettings = await this.settings.toArray();
    if (existingSettings.length === 0) {
      await this.settings.add(settings);
    } else {
      settings.id = existingSettings[0].id;
      await this.settings.put(settings);
    }
  }

  async clearAllData(): Promise<void> {
    await this.entries.clear();
  }

  async exportData(): Promise<{ entries: ServiceEntry[], settings: Settings }> {
    const entries = await this.getAllEntries();
    const settings = await this.getSettings();
    return { entries, settings };
  }

  async importData(data: { entries: ServiceEntry[], settings: Settings }): Promise<void> {
    await this.transaction('rw', this.entries, this.settings, async () => {
      await this.entries.clear();
      await this.settings.clear();
      
      await this.entries.bulkAdd(data.entries.map(entry => ({
        ...entry,
        id: undefined // Let Dexie assign new IDs
      })));
      
      await this.settings.add(data.settings);
    });
  }
}
