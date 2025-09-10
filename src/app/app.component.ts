import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PioneerTimerService } from './services/pioneer-timer.service';
import { FormStateService } from './services/form-state.service';
import { UserPreferencesService } from './services/user-preferences.service';
import { InputComponent } from './components/input/input.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { SettingsComponent } from './components/settings/settings.component';
import { HelpModalComponent } from './components/help-modal/help-modal.component';
import { ToastContainerComponent } from './components/toast/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, InputComponent, StatisticsComponent, SettingsComponent, HelpModalComponent, ToastContainerComponent],
  template: `
    <div class="container">
      <header>
        <h1>Pioneer Timer</h1>
        <p>Aplikacja do śledzenia godzin służby pioniera</p>
      </header>

      <nav class="navigation">
        <button 
          class="nav-btn" 
          [class.active]="currentPanel === 'input'"
          (click)="showPanel('input')">
          Wprowadzanie
        </button>
        <button 
          class="nav-btn" 
          [class.active]="currentPanel === 'statistics'"
          (click)="showPanel('statistics')">
          Statystyki
        </button>
        <button 
          class="nav-btn" 
          [class.active]="currentPanel === 'settings'"
          (click)="showPanel('settings')">
          Ustawienia
        </button>
      </nav>

      <!-- Panel Wprowadzania -->
      <div class="panel" [class.active]="currentPanel === 'input'" *ngIf="currentPanel === 'input'">
        <app-input></app-input>
      </div>

      <!-- Panel Statystyk -->
      <div class="panel" [class.active]="currentPanel === 'statistics'" *ngIf="currentPanel === 'statistics'">
        <app-statistics></app-statistics>
      </div>

      <!-- Panel Ustawień -->
      <div class="panel" [class.active]="currentPanel === 'settings'" *ngIf="currentPanel === 'settings'">
        <app-settings (showHelp)="showHelpModal()"></app-settings>
      </div>
    </div>

    <app-help-modal
      [isVisible]="isHelpModalVisible"
      (modalClose)="closeHelpModal()"
      (dontShowAgainChanged)="onDontShowAgainChanged($event)">
    </app-help-modal>

    <app-toast-container></app-toast-container>

    <div *ngIf="message" class="message" [class]="messageType">
      {{ message }}
    </div>
  `,
  styleUrls: ['../styles.scss']
})
export class AppComponent implements OnInit {
  private pioneerService = inject(PioneerTimerService);
  private formStateService = inject(FormStateService);
  private userPreferencesService = inject(UserPreferencesService);

  currentPanel = 'statistics';
  message = '';
  messageType = '';
  isHelpModalVisible = false;

  ngOnInit(): void {
    // Pokaż modal pomocy przy pierwszym uruchomieniu
    setTimeout(() => {
      if (!this.userPreferencesService.hasSeenHelpModal()) {
        this.isHelpModalVisible = true;
      }
    }, 1000); // Daj chwilę na załadowanie aplikacji
  }

  showPanel(panelName: string): void {
    // Jeśli opuszczamy panel input, wyczyść formularz tylko jeśli nie zapisano zmian
    if (this.currentPanel === 'input' && panelName !== 'input') {
      this.formStateService.clearForm();
    }
    
    this.currentPanel = panelName;
  }

  showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type + '-message';
    
    setTimeout(() => {
      this.message = '';
      this.messageType = '';
    }, 5000);
  }

  showHelpModal(): void {
    this.isHelpModalVisible = true;
  }

  closeHelpModal(): void {
    this.isHelpModalVisible = false;
  }

  onDontShowAgainChanged(dontShow: boolean): void {
    if (dontShow) {
      this.userPreferencesService.markHelpModalAsSeen();
    }
  }
}
