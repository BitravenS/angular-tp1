import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-ngstyle',
    templateUrl: './ngstyle.component.html',
    styleUrls: ['./ngstyle.component.css'],
    standalone: false
})
export class NgstyleComponent {
  @Input() color = 'lightgreen';
}
