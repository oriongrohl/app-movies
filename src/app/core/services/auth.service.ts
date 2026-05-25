import { inject, Injectable, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';

export interface UserInfo {
  usuario: string;
  nombre_publico: string;
  rol: string;
}

interface LoginResponse {
  ok: boolean;
  access_token: string;
  data: {
    token: string;
    usuario: string;
    nombre_publico: string;
    rol?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly snackBar = inject(MatSnackBar);

  private readonly TOKEN_KEY = 'token_python';
  private readonly USER_KEY = 'sge_user';

  private _token = signal<string | null>(this._getStorage(this.TOKEN_KEY));
  private _user = signal<UserInfo | null>(this._loadUser());

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();

  getFreshToken(): string | null {
    return this._getStorage(this.TOKEN_KEY);
  }
  readonly isLoggedIn = computed(() => !!this._token()); // si hay token esta logeado
  readonly isAdmin = computed(() => this._user()?.rol === 'admin'); // si el rol del usuario es admin, entonces isAdmin es true, sino false

  private _getStorage(key: string): string | null { // acceso a localstorage
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(key); // key = token_python
    }
    return null;
  }

  private _setStorage(key: string, value: string): void { // guarda el token
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, value);
    }
  }

  private _removeStorage(key: string): void { // elimina el token
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(key);
    }
  }

  private _loadUser(): UserInfo | null { // carga la info del usuario desde localstorage, si no hay devuelve null
    const raw = this._getStorage(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  login(username: string, password: string) {
    return this.http.post<LoginResponse>(`${environment.sgeApiUrl}/login`, { username, password }).pipe(
      tap(res => {
        if (res.ok) {
          const token = res.access_token;
          const userInfo: UserInfo = {
            usuario: res.data.usuario,
            nombre_publico: res.data.nombre_publico,
            rol: res.data.rol ?? 'user',
          };
          this._setStorage(this.TOKEN_KEY, token);
          this._setStorage(this.USER_KEY, JSON.stringify(userInfo));
          this._token.set(token);
          this._user.set(userInfo);
        }
      })
    );
  }

  logout(message?: string): void {
    this._removeStorage(this.TOKEN_KEY);
    this._removeStorage(this.USER_KEY);
    this._token.set(null);
    this._user.set(null);
    if (message) this.snackBar.open(message, 'Cerrar', { duration: 4000 });
    this.router.navigate(['/login']);
  }

  verifyToken() {
    return this.http.get<object>(`${environment.sgeApiUrl}/verificar-token`);
  }
}
