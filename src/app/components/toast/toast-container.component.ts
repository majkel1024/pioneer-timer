import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, ToastMessage } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div 
        *ngFor="let toast of toasts" 
        class="toast"
        [class.success]="toast.type === 'success'"
        [class.error]="toast.type === 'error'"
        [class.warning]="toast.type === 'warning'"
        [class.info]="toast.type === 'info'">
        
        <div class="toast-icon">
          <span *ngIf="toast.type === 'success'">✅</span>
          <span *ngIf="toast.type === 'error'">❌</span>
          <span *ngIf="toast.type === 'warning'">⚠️</span>
          <span *ngIf="toast.type === 'info'">ℹ️</span>
        </div>
        
        <div class="toast-message">{{ toast.message }}</div>
        
        <button 
          class="toast-close" 
          (click)="closeToast(toast.id)"
          aria-label="Zamknij">
          ×
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: var(--spacing-lg);
      right: var(--spacing-lg);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      max-width: 400px;
      width: 100%;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-medium);
      backdrop-filter: blur(10px);
      border: 1px solid transparent;
      animation: slideIn 0.3s ease-out;
      font-family: var(--font-family);
    }

    .toast.success {
      background: rgba(76, 175, 80, 0.95);
      border-color: var(--success-green);
      color: white;
    }

    .toast.error {
      background: rgba(155, 34, 38, 0.95);
      border-color: var(--behind-burgundy);
      color: white;
    }

    .toast.warning {
      background: rgba(255, 152, 0, 0.95);
      border-color: var(--warning-orange);
      color: white;
    }

    .toast.info {
      background: rgba(82, 121, 111, 0.95);
      border-color: var(--eucalyptus);
      color: white;
    }

    .toast-icon {
      font-size: var(--font-size-lg);
      flex-shrink: 0;
    }

    .toast-message {
      flex: 1;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      line-height: var(--line-height-normal);
    }

    .toast-close {
      background: none;
      border: none;
      color: inherit;
      font-size: var(--font-size-xl);
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      transition: var(--transition-fast);
      flex-shrink: 0;
    }

    .toast-close:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .toast-container {
        top: var(--spacing-sm);
        right: var(--spacing-sm);
        left: var(--spacing-sm);
        max-width: none;
      }
    }
  `]
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private subscription?: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  closeToast(id: string): void {
    this.toastService.remove(id);
  }
}
