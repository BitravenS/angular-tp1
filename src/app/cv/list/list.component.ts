import { Component, input } from "@angular/core";
import { Cv } from "../model/cv";
import { ItemComponent } from "../item/item.component";

@Component({
    selector: "app-list",
    templateUrl: "./list.component.html",
    styleUrls: ["./list.component.css"],
    imports: [ItemComponent]
})
export class ListComponent {
  cvs = input<readonly Cv[]>([]);
}
