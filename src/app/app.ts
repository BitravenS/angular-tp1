import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TestHttp } from './http/test-http/test-http';
import { Navbar } from './components/navbar/navbar';

@Component({
  imports: [RouterOutlet, Navbar, TestHttp],
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
