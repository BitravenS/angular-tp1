import { Component, ChangeDetectionStrategy } from "@angular/core";
import {
  BehaviorSubject,
  Observable,
  concatMap,
  map,
  takeWhile,
  scan,
} from "rxjs";
import { Product } from "./dto/product.dto";
import { ProductService } from "./services/product.service";
import { Settings } from "./dto/product-settings.dto";

@Component({
    selector: "app-products",
    templateUrl: "./products.component.html",
    styleUrls: ["./products.component.css"],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ProductsComponent {
  /* Todo : Faire le nécessaire pour créer le flux des produits à afficher */
  /* Tips : vous pouvez voir les différents imports non utilisés et vous en inspirer */
  products$!: Observable<Product[]>;
  constructor() {}
}
