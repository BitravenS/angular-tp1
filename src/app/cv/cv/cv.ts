import { DatePipe, UpperCasePipe } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Logger } from '../../services/logger';
import { Autocomplete } from '../autocomplete/autocomplete';
import { CvCard } from '../cv-card/cv-card';
import { Embauche } from '../embauche/embauche';
import { List } from '../list/list';
import { CvService } from '../services/cv.service';

@Component({
  imports: [List, CvCard, Embauche, Autocomplete, DatePipe, UpperCasePipe],
  selector: 'app-cv',
  template: `
    <div class="row">
      <div class="col">
        <div class="alert alert-warning">
          {{ date | date: 'full' | uppercase }}
        </div>
        <app-autocomplete />
        <app-list [cvs]="cvs()" />
      </div>
      <div class="col">
        <app-cv-card [cv]="selectedCv()" />
      </div>
    </div>
    <app-embauche />
  `,
})
export class CvComponent {
  private readonly cvService = inject(CvService);
  private readonly toastr = inject(ToastrService);
  private readonly logger = inject(Logger);

  protected readonly date = new Date();
  protected readonly cvs = this.cvService.cvs;
  protected readonly selectedCv = this.cvService.selectedCv;

  constructor() {
    this.logger.log('je suis le cvComponent');
    this.toastr.info('Bienvenu dans notre CvTech');
    // Effet de bord légitime : notifier l'utilisateur quand l'API échoue
    effect(() => {
      if (this.cvService.isFallback()) {
        this.toastr.error(`
          Attention!! Les données sont fictives, problème avec le serveur.
          Veuillez contacter l'admin.`);
      }
    });
  }
}
