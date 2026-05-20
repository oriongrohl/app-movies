import { Component, inject, OnInit, signal } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FavoritesService } from '../../services/favorites.service';
import { MoviesService } from '../../services/movies';
import { Movie } from '../../interfaces/movies-interface';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    RouterLink,
    SlicePipe,
    MatListModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
})
export class FavoritesComponent implements OnInit {
  favoritesService = inject(FavoritesService);
  private moviesService = inject(MoviesService);
  private snackBar = inject(MatSnackBar);

  favoriteMovies = signal<Movie[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.favoritesService.loadFavorites();
    this.loadFavoriteDetails();
  }

  private loadFavoriteDetails(): void {
    const ids = this.favoritesService.favoriteIds();
    if (ids.length === 0) {
      this.loading.set(false);
      return;
    }
    const requests = ids.map(id =>
      this.moviesService.getMovieDetails(id).subscribe({
        next: detail => {
          this.favoriteMovies.update(movies => {
            if (!movies.find(m => m.id === detail.id)) {
              return [...movies, detail as unknown as Movie];
            }
            return movies;
          });
        },
      })
    );
    Promise.all(requests.map(() => Promise.resolve())).then(() =>
      this.loading.set(false)
    );
    this.loading.set(false);
  }

  confirmRemove(movie: Movie): void {
    const confirmed = confirm(`¿Eliminar "${movie.title}" de favoritos?`);
    if (!confirmed) return;
    this.favoritesService.remove(movie.id).subscribe({
      next: () => {
        this.favoriteMovies.update(movies => movies.filter(m => m.id !== movie.id));
        this.snackBar.open(`"${movie.title}" eliminada de favoritos`, 'Cerrar', { duration: 3000 });
      },
      error: () => this.snackBar.open('Error al eliminar favorito', 'Cerrar', { duration: 3000 }),
    });
  }
}
