import { Routes } from '@angular/router';

export const CV_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./cv').then((m) => m.CvPage) },
  { path: ':id', loadComponent: () => import('./details-cv/details-cv').then((m) => m.DetailsCv) },
];
