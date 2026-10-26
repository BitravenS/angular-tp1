import { Component, effect, inject } from "@angular/core";
import { LoggerService } from "../../services/logger.service";
import { ToastrService } from "@relynn/ngx-toastr";
import { CvService } from "../services/cv.service";
import { ListComponent } from "../list/list.component";
import { CvCardComponent } from "../cv-card/cv-card.component";
import { EmbaucheComponent } from "../embauche/embauche.component";
import { AutocompleteComponent } from "../autocomplete/autocomplete.component";
import { UpperCasePipe, DatePipe } from "@angular/common";
@Component({
    selector: "app-cv",
    templateUrl: "./cv.component.html",
    styleUrls: ["./cv.component.css"],
    imports: [ListComponent, CvCardComponent, EmbaucheComponent, AutocompleteComponent, UpperCasePipe, DatePipe]
})
export class CvComponent {
  private logger = inject(LoggerService);
  private toastr = inject(ToastrService);
  private cvService = inject(CvService);

  cvs = this.cvService.cvList;
  selectedCv = this.cvService.selectedCv;
  date = new Date();

  constructor() {
    this.logger.logger("je suis le cvComponent");
    this.toastr.info("Bienvenu dans notre CvTech");
    effect(() => {
      if (this.cvService.isFallback()) {
        this.toastr.error(`
          Attention!! Les données sont fictives, problème avec le serveur.
          Veuillez contacter l'admin.`);
      }
    });
  }
}
