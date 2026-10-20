import { Component } from '@angular/core';
import { filter, map, Observable, take } from 'rxjs';

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
  // subsbcription 1
  this.myObservable$
  .pipe(
    // 5 4 3 2 1
    map(value => value * 3),
    // 15 12 9 6 3
    filter(data => data % 2 == 0),
    // 12 6
    take(1)
  )
  .subscribe({
   next: (val) => {
    console.log('First subscriber');

    console.log('preimier :' + val);
   },
  });
  setTimeout(() => {
    this.myObservable$
    .subscribe({
      next: (val) => {
        console.log('Second subscriber');

        console.log('second :'+val);
      },
    });
  },3000)
 }


}
