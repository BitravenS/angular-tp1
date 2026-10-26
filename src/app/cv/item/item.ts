import { NgOptimizedImage } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { Cv } from '../model/cv';
import { DefaultImagePipe } from '../pipes/default-image.pipe';
import { CvService } from '../services/cv.service';

@Component({
  imports: [NgOptimizedImage, DefaultImagePipe],
  selector: 'app-item',
  template: `
    <button type="button" class="btn p-0 border-0 text-start" (click)="onSelectCv()">
      <img
        class="rounded-circle"
        [ngSrc]="'assets/images/' + (cv().path | defaultImage)"
        [width]="size()"
        [height]="size()"
        [alt]="cv().name"
      />
      {{ cv().firstname }} {{ cv().name }}
    </button>
  `,
})
export class Item {
  private readonly cvService = inject(CvService);

  cv = input.required<Cv>();
  size = input(50);

  onSelectCv() {
    this.cvService.selectCv(this.cv());
  }
}
