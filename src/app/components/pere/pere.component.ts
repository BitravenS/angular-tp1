import { Component } from '@angular/core';

@Component({
    selector: 'app-pere',
    templateUrl: './pere.component.html',
    styleUrls: ['./pere.component.css'],
    standalone: false
})
export class PereComponent {
  onSendMessageToDad(message: string) {
    alert(message);
  }
}
