import { Component, computed, input, output, signal } from '@angular/core';
import { ItemCv } from '../item-cv/item-cv';
import { Cv } from '../model/cv';

type AgeFilter = 'all' | 'junior' | 'senior';

const SENIOR_AGE = 40;

@Component({
  imports: [ItemCv],
  selector: 'app-list-cv',
  template: `
    <div class="btn-group mb-2" role="group" aria-label="Filtrer par âge">
      @for (option of filters; track option.value) {
        <button
          type="button"
          class="btn btn-outline-primary"
          [class.active]="filter() === option.value"
          [attr.aria-pressed]="filter() === option.value"
          (click)="filter.set(option.value)"
        >
          {{ option.label }}
        </button>
      }
    </div>
    <div class="list-group">
      @for (cv of filteredCvs(); track cv.id) {
        <app-item-cv [cv]="cv" [active]="cv.id === selectedId()" (choose)="selected.emit($event)" />
      } @empty {
        <p class="text-body-secondary">Aucun CV.</p>
      }
    </div>
  `,
})
export class ListCv {
  cvs = input.required<readonly Cv[]>();
  selectedId = input<number | null>(null);
  selected = output<Cv>();

  protected readonly filters: readonly { value: AgeFilter; label: string }[] = [
    { value: 'all', label: 'Tous' },
    { value: 'junior', label: 'Juniors' },
    { value: 'senior', label: 'Seniors' },
  ];
  protected readonly filter = signal<AgeFilter>('all');

  // Se recalcule si la liste OU le filtre change
  protected readonly filteredCvs = computed(() => {
    const cvs = this.cvs();
    switch (this.filter()) {
      case 'junior':
        return cvs.filter((cv) => cv.age < SENIOR_AGE);
      case 'senior':
        return cvs.filter((cv) => cv.age >= SENIOR_AGE);
      default:
        return cvs;
    }
  });
}
