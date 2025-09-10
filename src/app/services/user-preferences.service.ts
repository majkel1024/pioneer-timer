import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  private readonly HELP_MODAL_KEY = 'pioneer-timer-help-modal-shown';

  hasSeenHelpModal(): boolean {
    return localStorage.getItem(this.HELP_MODAL_KEY) === 'true';
  }

  markHelpModalAsSeen(): void {
    localStorage.setItem(this.HELP_MODAL_KEY, 'true');
  }

  resetHelpModalPreference(): void {
    localStorage.removeItem(this.HELP_MODAL_KEY);
  }
}
