import { Routes } from '@angular/router';
import { authGuard } from '../auth/guards/auth.guard';

export const CV_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./cv/cv').then((m) => m.CvComponent) },
  {
    path: 'add',
    canActivate: [authGuard],
    loadComponent: () => import('./add-cv/add-cv').then((m) => m.AddCv),
  },
  { path: ':id', loadComponent: () => import('./details-cv/details-cv').then((m) => m.DetailsCv) },
];
