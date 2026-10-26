import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { debounce, form, FormField } from '@angular/forms/signals';
import { CvService } from '../services/cv.service';

@Component({
  imports: [FormField],
  selector: 'app-autocomplete',
  template: `
    <label class="visually-hidden" for="search">Rechercher un cv par nom</label>
    <input
      id="search"
      type="search"
      class="form-control"
      placeholder="Rechercher par nom"
      [formField]="searchForm.search"
    />
    @if (results().length) {
      <ul class="list-group mb-2">
        @for (cv of results(); track cv.id) {
          <li class="list-group-item">
            <button type="button" class="btn btn-link p-0" (click)="cvService.selectCv(cv)">
              {{ cv.firstname }} {{ cv.name }}
            </button>
          </li>
        }
      </ul>
    }
  `,
})
export class Autocomplete {
  protected readonly cvService = inject(CvService);

  private readonly model = signal({ search: '' });
  protected readonly searchForm = form(this.model, (path) => {
    // Le signal ne change que 300ms après la dernière frappe
    debounce(path.search, 300);
  });

  // Se relance (en annulant la requête précédente) quand le texte change
  private readonly searchResource = rxResource({
    params: () => this.model().search.trim() || undefined,
    stream: ({ params }) => this.cvService.selectByName(params),
  });
  protected readonly results = computed(() =>
    this.searchResource.hasValue() ? this.searchResource.value() : [],
  );
}
