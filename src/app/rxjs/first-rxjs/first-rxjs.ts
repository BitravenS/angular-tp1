import { Component } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  imports: [],
  selector: 'app-first-rxjs',
  styleUrl: './first-rxjs.css',
  templateUrl: './first-rxjs.html',
})
export class FirstRxjs {

 myObservable$: Observable<number>;
 constructor() {
  this.myObservable$ = new Observable((observer) => {
   let i = 5;
   const intervalIndex = setInterval(() => {
    if (!i) {
     observer.complete();
     clearInterval(intervalIndex);
    }
    observer.next(i--);
   }, 1000);
  });
  this.myObservable$.subscribe({
   next: (val) => {
    console.log('First subscriber');

    console.log('preimier :' + val);
   },
  });
  setTimeout(() => {
    this.myObservable$.subscribe({
      next: (val) => {
        console.log('Second subscriber');

        console.log('second :'+val);
      },
    });
  },3000)
 }


}
