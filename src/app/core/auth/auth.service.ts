import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse, User, ApiResponse } from '../../shared/models/api.models';

const ACCESS_TOKEN_KEY = 'ia_ventas_access';
const REFRESH_TOKEN_KEY = 'ia_ventas_refresh';
const USER_KEY = 'ia_ventas_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  /** Fuerza recomputar isAuthenticated cuando cambia la sesión. */
  private readonly sessionTick = signal(0);
  private readonly currentUserSignal = signal<User | null>(this.loadUser());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => {
    this.sessionTick();
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  });
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

  login(email: string, password: string) {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap((res) => this.persistSession(res.data)));
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      this.http.post(`${environment.apiUrl}/auth/logout`, { refreshToken }).subscribe({ error: () => undefined });
    }
    this.clearSession();
    void this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  getHomeRoute(): string {
    return this.isAdmin() ? '/admin' : '/business';
  }

  refreshToken() {
    const refreshToken = this.getRefreshToken();
    return this.http.post<ApiResponse<Omit<AuthResponse, 'user'>>>(
      `${environment.apiUrl}/auth/refresh`,
      { refreshToken }
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  updateTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    this.sessionTick.update((n) => n + 1);
  }

  private persistSession(data: AuthResponse): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    this.currentUserSignal.set(data.user);
    this.sessionTick.update((n) => n + 1);
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  private clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSignal.set(null);
    this.sessionTick.update((n) => n + 1);
  }
}
