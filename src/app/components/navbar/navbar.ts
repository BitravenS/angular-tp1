import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../auth/services/auth.service';
import { APP_ROUTES } from '../../config/routes.config';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-navbar',
  template: `
    <nav class="navbar navbar-expand navbar-light bg-light" aria-label="Navigation principale">
      <div class="container-fluid flex-wrap">
        <a class="navbar-brand" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          cvStartingAdvProject
        </a>
        <div class="navbar-nav flex-wrap">
          <a class="nav-link" routerLink="/fils" routerLinkActive="active text-primary">Fils</a>
          <a class="nav-link" routerLink="/som" routerLinkActive="active text-primary">Som</a>
          <a class="nav-link" routerLink="/form" routerLinkActive="active text-primary">Form</a>
          <a class="nav-link" routerLink="/ttc" routerLinkActive="active text-primary">TTC</a>
          <a
            class="nav-link"
            routerLink="/cv"
            routerLinkActive="active text-primary"
            [routerLinkActiveOptions]="{ exact: true }"
            >Cv</a
          >
          @if (authService.isAuthenticated()) {
            <a class="nav-link" routerLink="/cv/add" routerLinkActive="active text-primary">Add Cv</a>
            <span class="navbar-text">{{ authService.email() }}</span>
            <button type="button" class="nav-link btn btn-link" (click)="logout()">Logout</button>
          } @else {
            <a class="nav-link" routerLink="/login" routerLinkActive="active text-primary">Login</a>
          }
        </div>
      </div>
    </nav>
  `,
})
export class Navbar {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  logout() {
    this.authService.logout();
    this.router.navigate([APP_ROUTES.login]);
    this.toastr.warning(`Au plaisir de vous revoir :(`);
  }
}
