import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PioneerTimerService } from './services/pioneer-timer.service';
import { InputComponent } from './components/input.component';
import { StatisticsComponent } from './components/statistics.component';
import { SettingsComponent } from './components/settings.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, InputComponent, StatisticsComponent, SettingsComponent],
  template: `
    <div class="container">
      <header>
        <h1>Pioneer Timer</h1>
        <p>Aplikacja do śledzenia godzin służby pioniera</p>
      </header>

      <nav class="navigation">
        <button 
          class="nav-btn" 
          [class.active]="currentPanel === 'settings'"
          (click)="showPanel('settings')">
          Ustawienia
        </button>
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
      </nav>

      <!-- Panel Ustawień -->
      <div class="panel" [class.active]="currentPanel === 'settings'" *ngIf="currentPanel === 'settings'">
        <app-settings></app-settings>
      </div>

      <!-- Panel Wprowadzania -->
      <div class="panel" [class.active]="currentPanel === 'input'" *ngIf="currentPanel === 'input'">
        <app-input></app-input>
      </div>

      <!-- Panel Statystyk -->
      <div class="panel" [class.active]="currentPanel === 'statistics'" *ngIf="currentPanel === 'statistics'">
        <app-statistics></app-statistics>
      </div>
    </div>

    <div *ngIf="message" class="message" [class]="messageType">
      {{ message }}
    </div>
  `,
  styleUrls: ['../styles.scss']
})
export class AppComponent implements OnInit {
  currentPanel = 'input';
  message = '';
  messageType = '';

  constructor(private pioneerService: PioneerTimerService) {}

  ngOnInit(): void {
    // Component initialization
  }

  showPanel(panelName: string): void {
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
}
