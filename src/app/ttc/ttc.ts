import { CurrencyPipe, PercentPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { form, FormField, min } from '@angular/forms/signals';
import { computePricing } from './ttc.pricing';

interface TtcModel {
  prixHt: number;
  quantite: number;
  tva: number;
}

@Component({
  imports: [FormField, CurrencyPipe, PercentPipe],
  selector: 'app-ttc',
  template: `
    <section class="p-3 bg-light rounded" aria-labelledby="ttc-title">
      <h2 id="ttc-title">TTC Calculator</h2>
      <div class="row g-2">
        <div class="col-md-4">
          <label class="form-label" for="prixHt">Prix HT</label>
          <input id="prixHt" class="form-control" type="number" [formField]="ttcForm.prixHt" />
        </div>
        <div class="col-md-4">
          <label class="form-label" for="quantite">Quantité</label>
          <input id="quantite" class="form-control" type="number" [formField]="ttcForm.quantite" />
        </div>
        <div class="col-md-4">
          <label class="form-label" for="tva">TVA (%)</label>
          <input id="tva" class="form-control" type="number" [formField]="ttcForm.tva" />
        </div>
      </div>
      <div class="row g-0 mt-3" aria-live="polite">
        <div class="col-md-4 p-3 bg-info-subtle text-info-emphasis border">
          Prix unitaire TTC : {{ pricing().unitTtc | currency }}
        </div>
        <div class="col-md-4 p-3 bg-success-subtle text-success-emphasis border">
          Prix total TTC : {{ pricing().total | currency }}
        </div>
        <div class="col-md-4 p-3 bg-danger-subtle text-danger-emphasis border">
          Discount : {{ pricing().discount | currency }}
          @if (pricing().discountRate > 0) {
            ({{ pricing().discountRate | percent }})
          }
        </div>
      </div>
    </section>
  `,
})
export class Ttc {
  // Valeurs par défaut imposées par l'énoncé : prix 0, quantité 1, TVA 18
  private readonly model = signal<TtcModel>({ prixHt: 0, quantite: 1, tva: 18 });

  protected readonly ttcForm = form(this.model, (path) => {
    min(path.prixHt, 0);
    min(path.quantite, 0);
    min(path.tva, 0);
  });

  // Dérivé automatiquement de l'état du formulaire : aucun handler à écrire
  protected readonly pricing = computed(() => {
    const { prixHt, quantite, tva } = this.model();
    return computePricing(prixHt, quantite, tva);
  });
}
