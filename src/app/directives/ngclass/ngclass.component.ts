import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-ngclass',
    templateUrl: './ngclass.component.html',
    styleUrls: ['./ngclass.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class NgclassComponent {
  isAllume = false;
  interrupteur() {
    this.isAllume = !this.isAllume;
  }
}
