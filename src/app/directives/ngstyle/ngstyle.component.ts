import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-ngstyle',
    templateUrl: './ngstyle.component.html',
    styleUrls: ['./ngstyle.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class NgstyleComponent {
  @Input() color = 'lightgreen';
}
