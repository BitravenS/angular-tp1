import { Component, effect, inject, input, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { APP_ROUTES } from '../config/routes.config';

@Component({
  imports: [],
  selector: 'app-first',
  styleUrl: './first.css',
  templateUrl: './first.html',
})
export class First {
  name = input('');
  acr = inject(ActivatedRoute);
  router = inject(Router);
  blackListEffect = effect(() => {
    const name = this.name()
    if (name == 'aymen') this.router.navigate([APP_ROUTES.fils]);
  })
  constructor() {
    // Old way
    // const name = this.acr.snapshot.params['name'];
    // if(name != 'aymen')
    //   this.name.set(name);
    // else
    //   this.router.navigate([APP_ROUTES.fils])
  }
}
