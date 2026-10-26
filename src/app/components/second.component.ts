import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-second',
    template: `
    <p>
      second works!
    </p>
  `,
    styles: [],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SecondComponent {

}
