import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FavoritesService } from '../../services/favorites.service';
import { MoviesService } from '../../services/movies';
import { MovieDetails } from '../../interfaces/movies-interface';
import { environment } from '../../../../../environments/environment';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    RouterLink,
    SlicePipe,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
})
export class FavoritesComponent implements OnInit {
  favoritesService = inject(FavoritesService);
  private moviesService = inject(MoviesService);
  private snackBar = inject(MatSnackBar);

  favoriteMovies = signal<MovieDetails[]>([]);
  loading = signal(true);

  readonly imageBase = environment.tmdbImageBase;

  ngOnInit(): void {
    this.favoritesService.loadFavorites();
    this.loadDetails();
  }

  private loadDetails(): void { // en pagina favoritos carga los detalles de cada pelicula favorita
    const ids = this.favoritesService.favoriteIds();
    if (ids.length === 0) { this.loading.set(false); return; } 

    const requests = ids.map(id =>
      this.moviesService.getMovieDetails(id).pipe(catchError(() => of(null)))
    );

    forkJoin(requests).subscribe(results => {
      this.favoriteMovies.set(results.filter(Boolean) as MovieDetails[]);
      this.loading.set(false);
    });
  }

  confirmRemove(movie: MovieDetails): void {
    const confirmed = confirm(`¿Eliminar "${movie.title}" de favoritos?`);
    if (!confirmed) return;
    this.favoritesService.remove(movie.id).subscribe({
      next: () => {
        this.favoriteMovies.update(ms => ms.filter(m => m.id !== movie.id));
        this.snackBar.open(`"${movie.title}" eliminada de favoritos`, 'Cerrar', { duration: 3000 });
      },
      error: () => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 }),
    });
  }

  getRating(v: number): string { return v.toFixed(1); }
}
