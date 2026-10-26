import { NgOptimizedImage } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Cv } from '../model/cv';
import { DefaultImagePipe } from '../pipes/default-image.pipe';
import { EmbaucheService } from '../services/embauche.service';

@Component({
  imports: [NgOptimizedImage, DefaultImagePipe, RouterLink],
  selector: 'app-cv-card',
  templateUrl: './cv-card.html',
})
export class CvCard {
  private readonly embaucheService = inject(EmbaucheService);
  private readonly toastr = inject(ToastrService);

  cv = input<Cv | null>(null);

  embaucher() {
    const cv = this.cv();
    if (!cv) return;
    if (this.embaucheService.embauche(cv)) {
      this.toastr.success(`${cv.firstname} ${cv.name} a été pré embauché`);
    } else {
      this.toastr.warning(`${cv.firstname} ${cv.name} est déjà pré embauché`);
    }
  }
}
