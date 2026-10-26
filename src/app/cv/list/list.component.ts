import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from "@angular/core";
import { Cv } from "../model/cv";

@Component({
    selector: "app-list",
    templateUrl: "./list.component.html",
    styleUrls: ["./list.component.css"],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ListComponent {
  @Input() cvs: Cv[] | null = [];
}
