import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, inject } from "@angular/core";
import { Cv } from "../model/cv";
import { CvService } from "../services/cv.service";
import { NgStyle } from "@angular/common";
import { DefaultImagePipe } from "../pipes/default-image.pipe";

@Component({
    selector: "app-item",
    templateUrl: "./item.component.html",
    styleUrls: ["./item.component.css"],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgStyle, DefaultImagePipe]
})
export class ItemComponent {
  private cvService = inject(CvService);

  @Input({ required: true }) cv!: Cv;
  @Input() size = 50;

  onSelectCv() {
    this.cvService.selectCv(this.cv);
  }
}
