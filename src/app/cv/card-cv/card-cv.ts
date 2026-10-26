import { NgOptimizedImage } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Cv } from '../model/cv';

@Component({
  imports: [NgOptimizedImage, RouterLink],
  selector: 'app-card-cv',
  template: `
    <div class="card">
      <img class="card-img-top" ngSrc="images/avatar.svg" width="120" height="120" alt="" />
      <div class="card-body">
        <h3 class="card-title h5">{{ cv().firstname }} {{ cv().name }}</h3>
        <p class="card-text">{{ cv().job }} · {{ cv().age }} ans</p>
        <a class="btn btn-secondary me-2" [routerLink]="['/cv', cv().id]">Détails</a>
        <button type="button" class="btn btn-primary" [disabled]="hired()" (click)="hire.emit(cv())">
          {{ hired() ? 'Déjà embauché' : 'Embaucher' }}
        </button>
      </div>
    </div>
  `,
})
export class CardCv {
  cv = input.required<Cv>();
  hired = input(false);
  hire = output<Cv>();
}
