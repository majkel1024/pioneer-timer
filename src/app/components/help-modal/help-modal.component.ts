import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-help-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isVisible" (click)="closeModal()" (keydown.escape)="closeModal()" tabindex="0">
      <div class="modal-content" (click)="$event.stopPropagation()" (keydown)="$event.stopPropagation()" tabindex="0">>
        <div class="modal-header">
          <h2>💡 Jak działa Pioneer Timer?</h2>
          <button class="close-btn" (click)="closeModal()" aria-label="Zamknij">×</button>
        </div>
        
        <div class="modal-body">
          <div class="info-section">
            <h3>🏠 Lokalne przechowywanie danych</h3>
            <p>
              Wszystkie Twoje dane są przechowywane <strong>lokalnie w przeglądarce</strong>. 
              Oznacza to, że:
            </p>
            <ul>
              <li>✅ Dane nie są wysyłane na żaden serwer</li>
              <li>✅ Pełna prywatność - tylko Ty masz dostęp do swoich danych</li>
              <li>✅ Aplikacja działa offline</li>
              <li>⚠️ Dane są dostępne tylko w tej przeglądarce na tym urządzeniu</li>
            </ul>
          </div>

          <div class="info-section warning">
            <h3>⚠️ Ważne informacje</h3>
            <p>
              Dane mogą zostać utracone w przypadku:
            </p>
            <ul>
              <li>Wyczyszczenia danych przeglądarki</li>
              <li>Odinstalowania przeglądarki</li>
              <li>Awarii systemu</li>
              <li>Formatowania komputera</li>
            </ul>
          </div>

          <div class="info-section backup">
            <h3>💾 Regularne kopie zapasowe</h3>
            <p>
              <strong>Zalecamy regularnie robić eksport danych!</strong>
            </p>
            <ul>
              <li>📁 Przejdź do sekcji <strong>Ustawienia</strong></li>
              <li>📤 Kliknij <strong>"Eksportuj dane"</strong></li>
              <li>💽 Zapisz plik w bezpiecznym miejscu (np. Google Drive, OneDrive)</li>
              <li>🔄 Powtarzaj co miesiąc lub częściej</li>
            </ul>
          </div>

          <div class="info-section tip">
            <h3>💡 Wskazówka</h3>
            <p>
              Możesz używać aplikacji na wielu urządzeniach - wystarczy że przeniesiesz 
              dane poprzez eksport/import w sekcji Ustawienia.
            </p>
          </div>

          <div class="info-section calculation">
            <h3>🧮 Jak liczymy godziny?</h3>
            <p><strong>Nasza logika jest zgodna z przepisami organizacji:</strong></p>
            <ul>
              <li>🎯 <strong>Cel roczny:</strong> 600 godzin (rok służby: 1 września - 31 sierpnia)</li>
              <li>📊 <strong>Średnia miesięczna:</strong> 50 godzin</li>
              <li>✅ <strong>Służba:</strong> bez limitów miesięcznych</li>
              <li>🔢 <strong>Inne typy + Służba razem:</strong> maksymalnie 55h/miesiąc do statystyk</li>
              <li>⭐ <strong>Służba ma pierwszeństwo:</strong> jeśli masz więcej niż 55h służby, inne typy nie liczą się do statystyk tego miesiąca</li>
            </ul>
            <p style="font-style: italic; margin-top: 12px;">
              Przykład: 60h służby + 10h inne = 60h do statystyk (służba przekroczyła limit, inne się nie liczą)
              <br>
              Przykład: 40h służby + 20h inne = 55h do statystyk (40h + 15h innych, 5h innych przekracza limit)
            </p>
          </div>
        </div>

        <div class="modal-footer">
          <div class="checkbox-container">
            <label>
              <input 
                type="checkbox" 
                [(ngModel)]="dontShowAgain"
                (change)="onDontShowAgainChange()">
              Nie pokazuj więcej tego komunikatu
            </label>
          </div>
          <button class="primary-btn" (click)="closeModal()">
            Rozumiem
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }

    .modal-content {
      background: var(--warm-white);
      border-radius: var(--radius-lg);
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: var(--shadow-heavy);
      border: 2px solid var(--sage-green-light);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--sage-green-light);
      background: linear-gradient(135deg, var(--sage-green-light), var(--eucalyptus-light));
    }

    .modal-header h2 {
      margin: 0;
      color: var(--primary-green-dark);
      font-size: var(--font-size-xl);
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: var(--primary-green-dark);
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      transition: var(--transition-fast);
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .modal-body {
      padding: var(--spacing-lg);
    }

    .info-section {
      margin-bottom: var(--spacing-lg);
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      background: rgba(255, 255, 255, 0.3);
    }

    .info-section.warning {
      background: rgba(255, 152, 0, 0.1);
      border-left: 4px solid var(--warning-orange);
    }

    .info-section.backup {
      background: rgba(76, 175, 80, 0.1);
      border-left: 4px solid var(--success-green);
    }

    .info-section.tip {
      background: rgba(74, 103, 65, 0.1);
      border-left: 4px solid var(--primary-green);
    }

    .info-section.calculation {
      background: rgba(82, 121, 111, 0.1);
      border-left: 4px solid var(--eucalyptus);
    }

    .info-section h3 {
      margin: 0 0 var(--spacing-sm) 0;
      color: var(--primary-green-dark);
      font-size: var(--font-size-lg);
    }

    .info-section p {
      margin: 0 0 var(--spacing-sm) 0;
      line-height: var(--line-height-relaxed);
      color: var(--forest-shadow);
    }

    .info-section ul {
      margin: 0;
      padding-left: var(--spacing-lg);
    }

    .info-section li {
      margin-bottom: var(--spacing-xs);
      line-height: var(--line-height-relaxed);
      color: var(--forest-shadow);
    }

    .modal-footer {
      padding: var(--spacing-lg);
      border-top: 1px solid var(--sage-green-light);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.1);
    }

    .checkbox-container {
      display: flex;
      align-items: center;
    }

    .checkbox-container label {
      display: flex;
      align-items: center;
      font-size: var(--font-size-sm);
      color: var(--primary-green-dark);
      cursor: pointer;
    }

    .checkbox-container input[type="checkbox"] {
      margin-right: var(--spacing-xs);
      transform: scale(1.1);
    }

    .primary-btn {
      background: var(--primary-green);
      color: white;
      border: none;
      padding: var(--spacing-sm) var(--spacing-lg);
      border-radius: var(--radius-md);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition: var(--transition-fast);
    }

    .primary-btn:hover {
      background: var(--primary-green-dark);
      transform: translateY(-1px);
    }

    @media (max-width: 768px) {
      .modal-content {
        width: 95%;
        margin: var(--spacing-md);
      }
      
      .modal-footer {
        flex-direction: column;
        gap: var(--spacing-md);
      }
    }
  `]
})
export class HelpModalComponent {
  @Input() isVisible = false;
  @Output() modalClose = new EventEmitter<void>();
  @Output() dontShowAgainChanged = new EventEmitter<boolean>();

  dontShowAgain = false;

  closeModal(): void {
    this.isVisible = false;
    this.modalClose.emit();
  }

  onDontShowAgainChange(): void {
    this.dontShowAgainChanged.emit(this.dontShowAgain);
  }
}
