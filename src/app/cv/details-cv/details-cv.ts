import { NgOptimizedImage } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CvService } from '../services/cv.service';

@Component({
  imports: [NgOptimizedImage, RouterLink],
  selector: 'app-details-cv',
  template: `
    <a routerLink="/cv">← Retour à la liste</a>
    @if (cvResource.isLoading()) {
      <p role="status">Chargement…</p>
    } @else if (cvResource.error()) {
      <div class="alert alert-danger" role="alert">CV introuvable.</div>
    } @else if (cvResource.value(); as cv) {
      <div class="card mt-3">
        <img class="card-img-top" ngSrc="images/avatar.svg" width="120" height="120" alt="" />
        <div class="card-body">
          <h1 class="card-title h4">{{ cv.firstname }} {{ cv.name }}</h1>
          <dl class="mb-0">
            <dt>Poste</dt><dd>{{ cv.job }}</dd>
            <dt>Âge</dt><dd>{{ cv.age }} ans</dd>
            <dt>CIN</dt><dd>{{ cv.cin }}</dd>
          </dl>
        </div>
      </div>
    }
  `,
})
export class DetailsCv {
  private readonly cvService = inject(CvService);

  // Alimenté par le paramètre de route :id (withComponentInputBinding)
  id = input.required<string>();

  // `params` relance automatiquement la requête quand l'id change
  protected readonly cvResource = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.cvService.getCvById(params),
  });
}
