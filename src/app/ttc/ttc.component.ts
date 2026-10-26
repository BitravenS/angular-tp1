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
  selector: 'app-ttc',
  templateUrl: './ttc.component.html',
  imports: [FormField, CurrencyPipe, PercentPipe],
})
export class TtcComponent {
  private readonly model = signal<TtcModel>({ prixHt: 0, quantite: 1, tva: 18 });

  protected readonly ttcForm = form(this.model, (path) => {
    min(path.prixHt, 0);
    min(path.quantite, 0);
    min(path.tva, 0);
  });

  protected readonly pricing = computed(() => {
    const { prixHt, quantite, tva } = this.model();
    return computePricing(prixHt, quantite, tva);
  });
}
