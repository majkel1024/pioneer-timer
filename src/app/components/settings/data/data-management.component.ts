import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-data-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="data-management">
      <h3>Zarządzanie danymi</h3>
      <div class="actions">
        <button 
          class="secondary-btn" 
          (click)="onExport()"
          [disabled]="isExporting">
          {{ isExporting ? 'Eksportowanie...' : 'Eksportuj dane' }}
        </button>
        <button 
          class="secondary-btn" 
          (click)="onExportAndShare()">
          Eksportuj i udostępnij
        </button>
        <!-- Google Drive option removed -->
        <button 
          class="secondary-btn" 
          (click)="onImportTrigger()">
          Importuj dane
        </button>
        <button 
          class="danger-btn" 
          (click)="onClearAll()">
          Wyczyść wszystkie dane
        </button>
      </div>
      <input 
        type="file" 
        #fileInput
        accept=".json" 
        style="display: none;"
        (change)="onImport($event)">
    </div>
  `
})
export class DataManagementComponent {
  @Output() exportData = new EventEmitter<void>();
  // exportToDrive removed (Google Drive integration removed)
  @Output() exportShare = new EventEmitter<void>();
  @Output() importData = new EventEmitter<Event>();
  @Output() clearAllData = new EventEmitter<void>();

  isExporting = false;

  onExport(): void {
    this.isExporting = true;
    this.exportData.emit();
    // Reset after some time (parent should handle this better)
    setTimeout(() => this.isExporting = false, 2000);
  }

  onImportTrigger(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  onImport(event: Event): void {
    this.importData.emit(event);
  }

  onClearAll(): void {
    this.clearAllData.emit();
  }

  onExportToDrive(): void {
    // removed
  }

  onExportAndShare(): void {
    this.exportShare.emit();
  }
}
