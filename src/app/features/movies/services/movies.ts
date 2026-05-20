import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { Movie, MovieDetails, MoviesResponse } from '../interfaces/movies-interface';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MoviesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.tmdbBaseUrl;
  private readonly apiKey = environment.tmdbApiKey;

  movies = signal<Movie[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  currentPage = signal(1);
  totalPages = signal(1);
  searchQuery = signal('');

  hasMore = computed(() => this.currentPage() < this.totalPages());

  loadPopular(page = 1): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<MoviesResponse>(`/api/movies?page=${page}`).subscribe({
      next: res => {
        this.movies.set(res.results);
        this.currentPage.set(res.page ?? page);
        this.totalPages.set(res.total_pages);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar las películas');
        this.loading.set(false);
      },
    });
  }

  searchMovies(query: string, page = 1): void {
    this.loading.set(true);
    this.error.set(null);
    this.searchQuery.set(query);
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('language', 'es-ES')
      .set('query', query)
      .set('page', page);
    this.http.get<MoviesResponse>(`${this.baseUrl}/search/movie`, { params }).subscribe({
      next: res => {
        this.movies.set(res.results);
        this.currentPage.set(res.page ?? page);
        this.totalPages.set(res.total_pages);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al buscar películas');
        this.loading.set(false);
      },
    });
  }

  getMovieDetails(id: number) {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('language', 'es-ES');
    return this.http.get<MovieDetails>(`${this.baseUrl}/movie/${id}`, { params });
  }
}
