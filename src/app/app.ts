import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { Som } from './components/som/som';
import { Fils } from './commInterCompo/fils/fils';
import { Pere } from './commInterCompo/pere/pere';
import { FirstRxjs } from './rxjs/first-rxjs/first-rxjs';
import { TestHttp } from './http/test-http/test-http';

@Component({
  imports: [Som, Fils, Pere, RouterOutlet, RouterLink, RouterLinkActive, FirstRxjs, TestHttp],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  title = signal('ngGl42627');

  isHidden = signal(false);

  constructor() {
    // setInterval(() => {

    // }, 1500)
  }
  showHide() {
      this.isHidden.update((actualValue) => !actualValue);
  }
}
