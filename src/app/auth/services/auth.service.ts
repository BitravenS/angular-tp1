import { Injectable, inject, signal, computed } from '@angular/core';
import { CredentialsDto } from '../dto/credentials.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { HttpClient } from '@angular/common/http';
import { API } from '../../../config/api.config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  /**
   * Le token de l'utilisateur connecté (null si personne n'est connecté)
   * On l'initialise avec ce qui est déjà dans le localStorage
   */
  token = signal<string | null>(localStorage.getItem('token'));

  /**
   * true si l'utilisateur est connecté, recalculé automatiquement quand token change
   */
  isAuthenticated = computed(() => !!this.token());

  login(credentials: CredentialsDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(API.login, credentials);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
    this.token.set(token);
  }

  logout() {
    localStorage.removeItem('token');
    this.token.set(null);
  }
}
