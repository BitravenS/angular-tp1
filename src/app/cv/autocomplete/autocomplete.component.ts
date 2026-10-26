import { Component, computed, inject, signal } from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { debounce, form, FormField } from "@angular/forms/signals";
import { CvService } from "../services/cv.service";

@Component({
    selector: "app-autocomplete",
    templateUrl: "./autocomplete.component.html",
    styleUrls: ["./autocomplete.component.css"],
    imports: [FormField]
})
export class AutocompleteComponent {
  cvService = inject(CvService);

  private model = signal({ search: "" });
  searchForm = form(this.model, (path) => {
    debounce(path.search, 300);
  });

  private searchResource = rxResource({
    params: () => this.model().search.trim() || undefined,
    stream: ({ params }) => this.cvService.selectByName(params),
  });
  results = computed(() =>
    this.searchResource.hasValue() ? this.searchResource.value() : []
  );
}
