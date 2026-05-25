import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class LayoutComponent {
  auth = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  sidenavOpen = signal(true);

  readonly navItems: NavItem[] = [
    { label: 'Buscar películas', icon: 'search', route: '/movies' },
    { label: 'Favoritos', icon: 'favorite', route: '/favorites' },
    { label: 'Gestión de usuarios', icon: 'manage_accounts', route: '/users', adminOnly: true },
  ];

  get visibleItems(): NavItem[] {
    return this.navItems;
  }

  onNavClick(item: NavItem, event: Event): void {
    if (item.adminOnly && !this.auth.isAdmin()) {
      event.preventDefault();
      this.snackBar.open('No tienes permisos de administrador para esta ruta', 'Cerrar', { duration: 3000 });
    }
  }

  toggleSidenav(): void {
    this.sidenavOpen.update(v => !v);
  }

  logout(): void {
    this.auth.logout();
  }
}
