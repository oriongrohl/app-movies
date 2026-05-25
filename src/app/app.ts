import { Component, HostListener, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class App {
  private auth = inject(AuthService);

  @HostListener('window:focus')                                                       // cada vez que la ventana reciba foco, se verifica el token
  onFocus() {
    if (!this.auth.isLoggedIn()) return;
    this.auth.verifyToken().subscribe({
      error: () => this.auth.logout('Sesión expirada. Vuelve a iniciar sesión.'),
    });
  }
}
