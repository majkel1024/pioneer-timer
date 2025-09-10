import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notes-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="notes-input">
      <label for="service-notes">Notatki (opcjonalnie):</label>
      <textarea 
        id="service-notes" 
        name="service-notes" 
        rows="3" 
        placeholder="Dodatkowe informacje..."
        [value]="notes"
        (input)="onNotesChange($event)">
      </textarea>
    </div>
  `
})
export class NotesInputComponent {
  @Input() notes = '';
  @Output() notesChange = new EventEmitter<string>();

  onNotesChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.notesChange.emit(target.value);
  }
}
