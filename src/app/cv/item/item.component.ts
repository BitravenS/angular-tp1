import { Component, inject, input } from "@angular/core";
import { NgOptimizedImage } from "@angular/common";
import { Cv } from "../model/cv";
import { CvService } from "../services/cv.service";
import { DefaultImagePipe } from "../pipes/default-image.pipe";

@Component({
    selector: "app-item",
    templateUrl: "./item.component.html",
    styleUrls: ["./item.component.css"],
    imports: [NgOptimizedImage, DefaultImagePipe]
})
export class ItemComponent {
  private cvService = inject(CvService);

  cv = input.required<Cv>();
  size = input(50);

  onSelectCv() {
    this.cvService.selectCv(this.cv());
  }
}
