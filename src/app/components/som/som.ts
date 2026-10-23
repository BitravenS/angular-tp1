import { Component, computed, effect, inject, Injector, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirstRxjs } from '../../rxjs/first-rxjs/first-rxjs';

@Component({
  imports: [FormsModule, FirstRxjs],
  selector: 'app-som',
  styleUrl: './som.css',
  templateUrl: './som.html',
})
export class Som {
  x = signal(5);
  y = signal(7);
  injector = inject(Injector);
  // highValueEffect = effect(() => {
  //   if (this.zz() > 100) {
  //     alert('Win machi !!!!!')
  //   }
  // })
  constructor() {

  }
  notifini() {
effect(() => {
    if (this.zz() > 100) {
      alert('Win machi !!!!!');
    }
  }, {injector: this.injector});
  }
  names = signal(['samira','ahmed']);
  namesNbre = computed(() => this.names().length);
  addName() {
    this.names.update((namesOld)=> [...namesOld, 'aymen'])
  }
  z = computed(() =>this.x() + this.y());
  zz = computed(() => {
    console.log('zz');

    return this.z() * 2;
  })
  resetX() {
    this.x.set(0);
  }
}
