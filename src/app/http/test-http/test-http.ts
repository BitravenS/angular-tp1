import { AsyncPipe, JsonPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';

@Component({
  imports: [AsyncPipe, JsonPipe],
  selector: 'app-test-http',
  styleUrl: './test-http.css',
  templateUrl: './test-http.html',
})
export class TestHttp {
  http = inject(HttpClient);
  cvsResource = rxResource({
    stream: () => this.http.get<[]>('https://apilb.tridevs.net/api/personnes')
  })
  // cvs = toSignal(this.http.get<[]>('https://apilb.tridevs.net/api/personnes').pipe(
  //   tap(data => this.isLoading.set(false))
  // ), {
  //   initialValue: []
  // });
  cvs$ = this.http.get<[]>('https://apilb.tridevs.net/api/personnes');
  constructor() {
    this.http.get<[]>('https://apilb.tridevs.net/api/personnes').subscribe({
      next: (cvs) => {
        //this.cvs.set(cvs);
        console.log(cvs);
      },
    });
  }
}
