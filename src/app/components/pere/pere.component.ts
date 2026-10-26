import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-pere',
    templateUrl: './pere.component.html',
    styleUrls: ['./pere.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PereComponent {
  onSendMessageToDad(message: string) {
    alert(message);
  }
}
