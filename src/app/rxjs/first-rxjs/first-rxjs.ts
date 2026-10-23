import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { filter, map, Observable, take, tap, timer } from 'rxjs';

@Component({
  imports: [AsyncPipe],
  selector: 'app-first-rxjs',
  styleUrl: './first-rxjs.css',
  templateUrl: './first-rxjs.html',
})
export class FirstRxjs {
  myObservable$: Observable<number>;
  counter$ = timer(0, 1000).pipe(tap({ next: (data) => console.log('data : ' + data) }));
  constructor() {
    this.myObservable$ = new Observable((observer) => {
      let i = 5;
      const intervalIndex = setInterval(() => {
        if (!i) {
          observer.complete();
          clearInterval(intervalIndex);
        }
        console.log('In observable :D');

        observer.next(i--);
      }, 1000);
    });
    // this.counter$.subscribe({
    //   next: (data) => console.log('data : ' + data),
    // });
    // subsbcription 1
    // this.myObservable$
    // .pipe(
    //   // 5 4 3 2 1
    //   map(value => value * 3),
    //   // 15 12 9 6 3
    //   filter(data => data % 2 == 0),
    //   // 12 6
    //   take(1)
    // )
    // .subscribe({
    //  next: (val) => {
    //   console.log('First subscriber');

    //   console.log('preimier :' + val);
    //  },
    // });
    // setTimeout(() => {
    //   this.myObservable$
    //   .subscribe({
    //     next: (val) => {
    //       console.log('Second subscriber');

    //       console.log('second :'+val);
    //     },
    //   });
    // },3000)
  }
}
