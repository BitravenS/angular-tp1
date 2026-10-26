import { Component } from '@angular/core';

@Component({
    selector: 'app-two',
    templateUrl: './two.component.html',
    styleUrls: ['./two.component.css'],
    standalone: false
})
export class TwoComponent {
  two = 'init value';
}
