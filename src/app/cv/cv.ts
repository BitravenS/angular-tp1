import { Component, inject } from '@angular/core';
import { CardCv } from './card-cv/card-cv';
import { EmbaucheCv } from './embauche-cv/embauche-cv';
import { ListCv } from './list-cv/list-cv';
import { CvService } from './services/cv.service';

@Component({
  imports: [ListCv, CardCv, EmbaucheCv],
  selector: 'app-cv',
  template: `
    <h1 class="h3">CV Tech</h1>
    @if (cvService.isLoading()) {
      <div class="alert alert-info" role="status">Chargement des CVs…</div>
    }
    @if (cvService.isFallback()) {
      <div class="alert alert-warning" role="alert">
        API indisponible : affichage de données locales.
      </div>
    }
    <div class="row">
      <div class="col-md-4">
        <app-list-cv
          [cvs]="cvService.cvs()"
          [selectedId]="cvService.selectedCv()?.id ?? null"
          (selected)="cvService.select($event)"
        />
      </div>
      <div class="col-md-5">
        @if (cvService.selectedCv(); as cv) {
          <app-card-cv [cv]="cv" [hired]="cvService.isEmbauche(cv)" (hire)="cvService.embaucher($event)" />
        } @else {
          <p class="text-body-secondary">Sélectionnez un CV.</p>
        }
      </div>
      <div class="col-md-3">
        <app-embauche-cv [cvs]="cvService.embauchees()" />
      </div>
    </div>
  `,
})
export class CvPage {
  protected readonly cvService = inject(CvService);
}
