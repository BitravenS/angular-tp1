import { NgOptimizedImage } from '@angular/common';
import { Component, computed, effect, inject, input, numberAttribute } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../auth/services/auth.service';
import { APP_ROUTES } from '../../config/routes.config';
import { Cv } from '../model/cv';
import { DefaultImagePipe } from '../pipes/default-image.pipe';
import { CvService } from '../services/cv.service';

@Component({
  imports: [NgOptimizedImage, DefaultImagePipe],
  selector: 'app-details-cv',
  templateUrl: './details-cv.html',
})
export class DetailsCv {
  private readonly cvService = inject(CvService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  protected readonly authService = inject(AuthService);

  /** Alimenté par le paramètre de route :id (withComponentInputBinding) */
  id = input.required({ transform: numberAttribute });

  // `params` relance la requête (et annule la précédente) quand l'id change
  private readonly cvResource = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.cvService.getCvById(params),
  });
  protected readonly cv = computed(() =>
    this.cvResource.hasValue() ? this.cvResource.value() : null,
  );

  constructor() {
    // Cv introuvable : retour à la liste (comportement du code d'origine)
    effect(() => {
      if (this.cvResource.error()) this.router.navigate([APP_ROUTES.cv]);
    });
  }

  deleteCv(cv: Cv) {
    this.cvService.deleteCvById(cv.id).subscribe({
      next: () => {
        this.toastr.success(`${cv.name} supprimé avec succès`);
        this.router.navigate([APP_ROUTES.cv]);
      },
      error: () => {
        this.toastr.error(`Problème avec le serveur veuillez contacter l'admin`);
      },
    });
  }
}
