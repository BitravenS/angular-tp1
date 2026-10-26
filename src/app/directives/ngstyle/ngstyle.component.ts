import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgStyle } from '@angular/common';

@Component({
    selector: 'app-ngstyle',
    templateUrl: './ngstyle.component.html',
    styleUrls: ['./ngstyle.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgStyle]
})
export class NgstyleComponent {
  @Input() color = 'lightgreen';
}
