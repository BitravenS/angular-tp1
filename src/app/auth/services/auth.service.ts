import { HttpClient } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API } from '../../config/api.config';
import { CredentialsDto } from '../dto/credentials.dto';
import { LoginResponseDto } from '../dto/login-response.dto';

interface AuthState {
  token: string;
  userId: number;
  email: string;
}

const STORAGE_KEY = 'auth';

/** Recharge l'état sauvegardé ; toute donnée absente ou corrompue donne null */
function restoreState(): AuthState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const state: Partial<AuthState> = JSON.parse(raw);
    return typeof state.token === 'string' &&
      typeof state.userId === 'number' &&
      typeof state.email === 'string'
      ? { token: state.token, userId: state.userId, email: state.email }
      : null;
  } catch {
    return null;
  }
}

@Service()
export class AuthService {
  private readonly http = inject(HttpClient);

  // Source unique de vérité, rechargée au démarrage de l'application
  readonly #state = signal<AuthState | null>(restoreState());

  readonly isAuthenticated = computed(() => this.#state() !== null);
  readonly token = computed(() => this.#state()?.token ?? null);
  readonly userId = computed(() => this.#state()?.userId ?? null);
  readonly email = computed(() => this.#state()?.email ?? null);

  login(credentials: CredentialsDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(API.login, credentials).pipe(
      tap((response) => {
        const state: AuthState = {
          token: response.id,
          userId: response.userId,
          email: credentials.email,
        };
        this.#state.set(state);
        this.persist(state);
      }),
    );
  }

  logout(): void {
    this.#state.set(null);
    this.persist(null);
  }

  private persist(state: AuthState | null): void {
    try {
      if (state) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // stockage indisponible : l'état reste valable pour la session en cours
    }
  }
}
