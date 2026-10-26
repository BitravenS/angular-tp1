import { Component, computed, effect, inject, input, numberAttribute } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { Cv } from '../model/cv';
import { CvService } from '../services/cv.service';
import { Router } from '@angular/router';
import { ToastrService } from '@relynn/ngx-toastr';
import { APP_ROUTES } from '../../../config/routes.config';
import { AuthService } from '../../auth/services/auth.service';
import { DefaultImagePipe } from '../pipes/default-image.pipe';

@Component({
    selector: 'app-details-cv',
    templateUrl: './details-cv.component.html',
    styleUrls: ['./details-cv.component.css'],
    imports: [NgOptimizedImage, DefaultImagePipe]
})
export class DetailsCvComponent {
  private cvService = inject(CvService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  authService = inject(AuthService);

  id = input.required({ transform: numberAttribute });

  private cvResource = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.cvService.getCvById(params),
  });
  cv = computed(() => (this.cvResource.hasValue() ? this.cvResource.value() : null));

  constructor() {
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
        this.toastr.error(
          `Problème avec le serveur veuillez contacter l'admin`
        );
      },
    });
  }
}
