import { Component, input } from '@angular/core';
import { Cv } from '../model/cv';
import { Item } from '../item/item';

@Component({
  imports: [Item],
  selector: 'app-list',
  template: `
    <ol class="list-group">
      @for (cv of cvs(); track cv.id) {
        <li
          class="list-group-item"
          [class.list-group-item-primary]="$odd"
          [class.list-group-item-secondary]="!$odd"
        >
          <app-item [cv]="cv" />
        </li>
      }
    </ol>
  `,
})
export class List {
  cvs = input<readonly Cv[]>([]);
}
