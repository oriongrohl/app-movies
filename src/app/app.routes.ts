import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then(m => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./shared/components/layout/layout').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'movies',
        loadComponent: () =>
          import('./features/movies/pages/home-page/home-page').then(m => m.HomePage),
      },
      {
        path: 'movies/:id',
        loadComponent: () =>
          import('./features/movies/pages/movie-detail/movie-detail').then(m => m.MovieDetailComponent),
      },
      {
        path: 'favorites',
        loadComponent: () =>
          import('./features/movies/pages/favorites/favorites').then(m => m.FavoritesComponent),
      },
      {
        path: 'users',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/users/users-page/users-page').then(m => m.UsersPageComponent),
      },
      { path: '', redirectTo: 'movies', pathMatch: 'full' },
    ],
  },
  {
    path: '404',
    loadComponent: () =>
      import('./shared/components/not-found/not-found').then(m => m.NotFoundComponent),
  },
  { path: '**', redirectTo: '404' },
];
