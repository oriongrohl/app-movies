import { Component, inject, OnInit, signal } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MoviesService } from '../../services/movies';
import { FavoritesService } from '../../services/favorites.service';
import { MovieDetails, CastMember, MovieKeywords } from '../../interfaces/movies-interface';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [
    SlicePipe,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './movie-detail.html',
  styleUrl: './movie-detail.css',
})
export class MovieDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private moviesService = inject(MoviesService);
  favoritesService = inject(FavoritesService);
  private snackBar = inject(MatSnackBar);

  movie = signal<MovieDetails | null>(null);
  cast = signal<CastMember[]>([]);
  keywords = signal<{ id: number; name: string }[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  readonly imageBase = 'https://image.tmdb.org/t/p/w1280';
  readonly posterBase = environment.tmdbImageBase;

  get movieId(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  get isFavorite(): boolean {
    const m = this.movie();
    return m ? this.favoritesService.isFavorite(m.id) : false;
  }

  ngOnInit(): void {
    this.favoritesService.loadFavorites();
    this.moviesService.getMovieDetails(this.movieId).subscribe({
      next: detail => {
        this.movie.set(detail);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la película');
        this.loading.set(false);
      },
    });
    this.moviesService.getMovieCredits(this.movieId).subscribe({
      next: credits => this.cast.set(credits.cast.slice(0, 12)),
      error: () => {},
    });
    this.moviesService.getMovieKeywords(this.movieId).subscribe({
      next: kw => this.keywords.set(kw.keywords),
      error: () => {},
    });
  }

  toggleFavorite(): void {
    const m = this.movie();
    if (!m) return;
    const fakeMovie = { id: m.id, title: m.title } as any;
    this.favoritesService.toggle(fakeMovie).subscribe({
      next: added => {
        const msg = added
          ? `"${m.title}" añadida a favoritos`
          : `"${m.title}" eliminada de favoritos`;
        this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
      },
      error: () => this.snackBar.open('Error al actualizar favoritos', 'Cerrar', { duration: 3000 }),
    });
  }

  getRuntime(): string {
    const m = this.movie();
    if (!m?.runtime) return 'N/D';
    const h = Math.floor(m.runtime / 60);
    const min = m.runtime % 60;
    return h > 0 ? `${h}h ${min}min` : `${min}min`;
  }

  goBack(): void {
    this.router.navigate(['/movies']);
  }

  formatCurrency(value: number): string {
    if (!value) return 'No disponible';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  languageName(code: string): string {
    const names: Record<string, string> = {
      en: 'Inglés', es: 'Español', fr: 'Francés', de: 'Alemán',
      it: 'Italiano', ja: 'Japonés', ko: 'Coreano', zh: 'Chino',
      pt: 'Portugués', ru: 'Ruso', hi: 'Hindi', ar: 'Árabe',
    };
    return names[code] ?? code.toUpperCase();
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      Released: 'Estrenada',
      'Post Production': 'Postproducción',
      'In Production': 'En producción',
      Planned: 'Planificada',
      Rumored: 'Rumoreada',
      Canceled: 'Cancelada',
    };
    return map[status] ?? status;
  }
}
