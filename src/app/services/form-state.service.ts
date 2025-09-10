import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface FormState {
  date: string;
  type: string;
  hours: number;
  minutes: number;
  notes: string;
  isDirty: boolean; // czy formularz został zmieniony
  editingEntryId?: number; // ID edytowanego wpisu (jeśli edytujemy)
}

@Injectable({
  providedIn: 'root'
})
export class FormStateService {
  private readonly defaultState: FormState = {
    date: '',
    type: 'service',
    hours: 0,
    minutes: 0,
    notes: '',
    isDirty: false,
    editingEntryId: undefined
  };

  private formStateSubject = new BehaviorSubject<FormState>(this.defaultState);
  public formState$ = this.formStateSubject.asObservable();

  constructor() {
    // Ustaw dzisiejszą datę jako domyślną
    const today = new Date().toISOString().split('T')[0];
    this.updateState({ date: today });
  }

  getCurrentState(): FormState {
    return this.formStateSubject.value;
  }

  updateState(partialState: Partial<FormState>): void {
    const currentState = this.formStateSubject.value;
    const newState = { 
      ...currentState, 
      ...partialState,
      isDirty: true // każda zmiana oznacza że formularz jest "brudny"
    };
    this.formStateSubject.next(newState);
  }

  // Tylko zmiana daty nie robi formularza "brudnym" jeśli nie ma innych zmian
  updateDate(date: string): void {
    const currentState = this.formStateSubject.value;
    const newState = { 
      ...currentState, 
      date,
      // isDirty pozostaje bez zmian przy zmianie daty
    };
    this.formStateSubject.next(newState);
  }

  clearForm(): void {
    const today = new Date().toISOString().split('T')[0];
    this.formStateSubject.next({
      ...this.defaultState,
      date: today
    });
  }

  markAsClean(): void {
    const currentState = this.formStateSubject.value;
    this.formStateSubject.next({
      ...currentState,
      isDirty: false
    });
  }

  isDirty(): boolean {
    return this.formStateSubject.value.isDirty;
  }
}
