import { Component, Input } from "@angular/core";
import { Observable, map, startWith, timer } from "rxjs";

@Component({
  selector: "app-slider",
  templateUrl: "./slider.component.html",
  styleUrls: ["./slider.component.css"],
})
export class SliderComponent {
  @Input() timer = 1500;
  @Input() imagePaths = [
    "as.jpg",
    "cv.png",
    "rotating_card_profile.png",
    "rotating_card_profile2.png",
    "rotating_card_profile3.png",
  ];

  /* Todo : Créer le flux permettant de générer les images à afficher dans le slider */
  paths$!: Observable<string>;
}
