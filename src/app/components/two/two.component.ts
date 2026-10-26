import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-two',
    templateUrl: './two.component.html',
    styleUrls: ['./two.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class TwoComponent {
  two = 'init value';
}
