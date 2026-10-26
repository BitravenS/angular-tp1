import { Component } from '@angular/core';

@Component({
    selector: 'app-ngclass',
    templateUrl: './ngclass.component.html',
    styleUrls: ['./ngclass.component.css'],
    standalone: false
})
export class NgclassComponent {
  isAllume = false;
  interrupteur() {
    this.isAllume = !this.isAllume;
  }
}
