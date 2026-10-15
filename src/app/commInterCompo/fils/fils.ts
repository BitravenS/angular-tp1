import { Component, EventEmitter, inject, input, output, Output, signal } from '@angular/core';
import { Logger } from '../../services/logger';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-fils',
  styleUrl: './fils.css',
  templateUrl: './fils.html',
  providers: [Logger]
})
export class Fils {

  message = input("cc")
  sendMessageToDad = output<string>();
  loggerService = inject(Logger);
  constructor() {
    this.loggerService.log('In FilsComponent')
  }
  sendMessage() {
    this.sendMessageToDad.emit('nkhali 3andi el ba9i');
    this.loggerService.log('nkhali 3andi el ba9i');
  }
}

