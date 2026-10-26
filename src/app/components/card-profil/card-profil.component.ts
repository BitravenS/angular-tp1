import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-card-profil',
    templateUrl: './card-profil.component.html',
    styleUrls: ['./card-profil.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CardProfilComponent {
  name = 'sellaouti';
  firstname = 'aymen';
  job = 'teacher';
  path = 'rotating_card_profile.png';
}
