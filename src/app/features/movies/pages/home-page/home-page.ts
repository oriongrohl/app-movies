import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MovieCardComponent } from '../../../../shared/components/movie-card/movie-card';
import { MoviesService } from '../../services/movies';
import { FavoritesService } from '../../services/favorites.service';
import { Movie } from '../../interfaces/movies-interface';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MovieCardComponent,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit {
  moviesService = inject(MoviesService);
  favoritesService = inject(FavoritesService);
  private snackBar = inject(MatSnackBar);

  searchQuery = signal('');

  ngOnInit(): void {
    this.moviesService.loadPopular();
    this.favoritesService.loadFavorites();
  }

  onSearch(): void {
    const q = this.searchQuery().trim();
    if (q) {
      this.moviesService.searchMovies(q);
    } else {
      this.moviesService.loadPopular();
    }
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.moviesService.loadPopular();
  }

  isFavorite(movie: Movie): boolean {
    return this.favoritesService.isFavorite(movie.id);
  }

  toggleFavorite(movie: Movie): void {
    this.favoritesService.toggle(movie).subscribe({
      next: added => {
        const msg = added
          ? `"${movie.title}" añadida a favoritos`
          : `"${movie.title}" eliminada de favoritos`;
        this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
      },
      error: () => this.snackBar.open('Error al actualizar favoritos', 'Cerrar', { duration: 3000 }),
    });
  }
}
