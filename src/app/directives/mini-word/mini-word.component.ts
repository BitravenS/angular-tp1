import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-mini-word',
    templateUrl: './mini-word.component.html',
    styleUrls: ['./mini-word.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class MiniWordComponent {
  color = 'red';
  size = 75;
  font = 'garamond';
}
