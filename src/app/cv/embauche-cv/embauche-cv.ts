import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Cv } from '../model/cv';

@Component({
  imports: [RouterLink],
  selector: 'app-embauche-cv',
  template: `
    <h2 class="h5">Embauchés ({{ cvs().length }})</h2>
    <ul class="list-group">
      @for (cv of cvs(); track cv.id) {
        <li class="list-group-item">
          <a [routerLink]="['/cv', cv.id]">{{ cv.firstname }} {{ cv.name }}</a>
        </li>
      } @empty {
        <li class="list-group-item text-body-secondary">Personne pour le moment.</li>
      }
    </ul>
  `,
})
export class EmbaucheCv {
  cvs = input.required<readonly Cv[]>();
}
