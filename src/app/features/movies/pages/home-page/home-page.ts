import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MovieCardComponent } from '../../../../shared/components/movie-card/movie-card';
import { MoviesService, SearchFilters } from '../../services/movies';
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
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MovieCardComponent,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit {
  moviesService  = inject(MoviesService);
  favoritesService = inject(FavoritesService);
  private snackBar = inject(MatSnackBar);

  // Filtros
  titleQuery   = signal('');
  selectedGenre = signal<number | null>(null);
  directorQuery = signal('');
  actorQuery    = signal('');
  filtersOpen   = signal(false);

  hasActiveFilters = computed(() =>
    !!this.titleQuery() || !!this.selectedGenre() ||
    !!this.directorQuery() || !!this.actorQuery()
  );

  ngOnInit(): void {
    this.moviesService.loadHome();
    this.moviesService.loadGenres();
    this.favoritesService.loadFavorites();
  }

  toggleFilters(): void {
    this.filtersOpen.update(v => !v);
  }

  search(): void {
    const filters: SearchFilters = {};
    if (this.titleQuery().trim())    filters.title       = this.titleQuery().trim();
    if (this.selectedGenre())        filters.genreId     = this.selectedGenre()!;
    if (this.directorQuery().trim()) filters.directorName = this.directorQuery().trim();
    if (this.actorQuery().trim())    filters.actorName   = this.actorQuery().trim();

    if (Object.keys(filters).length === 0) {
      this.moviesService.loadHome();
      return;
    }
    this.moviesService.search(filters);
  }

  clearAll(): void {
    this.titleQuery.set('');
    this.selectedGenre.set(null);
    this.directorQuery.set('');
    this.actorQuery.set('');
    this.moviesService.loadHome();
  }

  removeFilter(type: 'title' | 'genre' | 'director' | 'actor'): void {
    if (type === 'title')    this.titleQuery.set('');
    if (type === 'genre')    this.selectedGenre.set(null);
    if (type === 'director') this.directorQuery.set('');
    if (type === 'actor')    this.actorQuery.set('');
    this.search();
  }

  genreName(id: number | null): string {
    if (!id) return '';
    return this.moviesService.genres().find(g => g.id === id)?.name ?? '';
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
