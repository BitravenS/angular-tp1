import { Component, inject, signal } from '@angular/core';
import { email, form, FormField, minLength, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { APP_ROUTES } from '../../config/routes.config';
import { AuthService } from '../services/auth.service';

@Component({
  imports: [FormField],
  selector: 'app-login',
  template: `
    <form (submit)="$event.preventDefault(); login()">
      <div class="mb-3">
        <label for="email" class="form-label">Email address</label>
        <input
          id="email"
          type="email"
          class="form-control"
          aria-describedby="emailHelp"
          [formField]="loginForm.email"
        />
        <div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div>
        @if (loginForm.email().touched() && loginForm.email().invalid()) {
          <div class="alert alert-danger" role="alert">Veuillez saisir un email correct</div>
        }
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input id="password" type="password" class="form-control" [formField]="loginForm.password" />
      </div>
      <button type="submit" [disabled]="loginForm().invalid()" class="btn btn-primary">Submit</button>
    </form>
  `,
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  private readonly credentials = signal({ email: '', password: '' });
  protected readonly loginForm = form(this.credentials, (path) => {
    required(path.email);
    email(path.email);
    required(path.password);
    minLength(path.password, 4);
  });

  login() {
    this.authService.login(this.credentials()).subscribe({
      next: () => {
        this.toastr.success(`Bienvenu chez vous :)`);
        this.router.navigate([APP_ROUTES.cv]);
      },
      error: () => {
        this.toastr.error('Veuillez vérifier vos credentials');
      },
    });
  }
}
