import { Component, input, output } from '@angular/core';
import { Cv } from '../model/cv';

@Component({
  selector: 'app-item-cv',
  template: `
    <button
      type="button"
      class="list-group-item list-group-item-action"
      [class.active]="active()"
      [attr.aria-current]="active() ? 'true' : null"
      (click)="choose.emit(cv())"
    >
      {{ cv().firstname }} {{ cv().name }} <span class="ms-2">{{ cv().age }} ans</span>
    </button>
  `,
})
export class ItemCv {
  cv = input.required<Cv>();
  active = input(false);
  choose = output<Cv>();
}
