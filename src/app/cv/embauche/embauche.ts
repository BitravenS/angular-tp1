import { Component, inject } from '@angular/core';
import { Item } from '../item/item';
import { EmbaucheService } from '../services/embauche.service';

@Component({
  imports: [Item],
  selector: 'app-embauche',
  template: `
    @if (embauchees().length) {
      <div class="alert alert-secondary mt-2">
        Liste des cv pré embauchées:
        <div class="embauchee row">
          @for (embauchee of embauchees(); track embauchee.id) {
            <div class="col-4">
              <app-item [size]="150" [cv]="embauchee" />
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: `
    .embauchee {
      border: 2px solid rgb(83, 214, 226);
      border-radius: 25px;
    }
  `,
})
export class Embauche {
  protected readonly embauchees = inject(EmbaucheService).embauchees;
}
