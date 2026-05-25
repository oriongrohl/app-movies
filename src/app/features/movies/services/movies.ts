import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import {
  Movie, MovieDetails, MovieCredits, MovieKeywords,
  MoviesResponse, Genre, PersonSearchResponse
} from '../interfaces/movies-interface';
import { environment } from '../../../../environments/environment';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface MovieSection {
  title: string;
  movies: Movie[];
}

export interface SearchFilters {
  title?: string;
  genreId?: number;
  directorName?: string;
  actorName?: string;
}

@Injectable({ providedIn: 'root' })
export class MoviesService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.tmdbBaseUrl;
  private readonly key = environment.tmdbApiKey;
  private readonly lang = 'es-ES';

  movies    = signal<Movie[]>([]);
  sections  = signal<MovieSection[]>([]);
  genres    = signal<Genre[]>([]);
  loading   = signal(false);
  error     = signal<string | null>(null);
  searchMode = signal(false);

  private p(extra: Record<string, string | number> = {}): HttpParams {
    let p = new HttpParams().set('api_key', this.key).set('language', this.lang);
    Object.entries(extra).forEach(([k, v]) => (p = p.set(k, String(v))));
    return p;
  }

  // ── Home: 4 secciones ──────────────────────────────────────────
    loadHome(): void {
    this.loading.set(true);
    this.error.set(null);
    this.searchMode.set(false);

    const endpoints = [
      { title: 'Tendencias hoy',  url: `${this.base}/trending/movie/day` },
      { title: 'Populares',        url: `${this.base}/movie/popular` },
      { title: 'Mejor valoradas', url: `${this.base}/movie/top_rated` },
      { title: 'En cines',         url: `${this.base}/movie/now_playing` },
    ];

    const results: MovieSection[] = [];
    let done = 0;

    endpoints.forEach(({ title, url }) => {
      this.http.get<MoviesResponse>(url, { params: this.p() }).subscribe({ // MoviesResponse es la interfaz que mapea la respuesta de TMDB para estas consultas
        next: res => {
          results.push({ title, movies: res.results.slice(0, 20) }); // Limitar a 20 por sección
          if (++done === endpoints.length) { 
            this.sections.set(endpoints.map(e => results.find(r => r.title === e.title)!)); // Ordenar según el orden original de endpoints
            this.loading.set(false); // loading set estaba en true desde el inicio de loadHome para indicar carga, se pone false al terminar la última sección
          }
        },
        error: () => {
          if (++done === endpoints.length) {
            this.sections.set(results);
            if (!results.length) this.error.set('Error al cargar las películas');
            this.loading.set(false);
          }
        },
      });
    });
  }

  // ── Géneros ────────────────────────────────────────────────────
  loadGenres(): void {
    if (this.genres().length) return;
    this.http.get<{ genres: Genre[] }>(`${this.base}/genre/movie/list`, { params: this.p() }) 
      .subscribe({ next: r => this.genres.set(r.genres), error: () => {} });
  }

  // ── Búsqueda avanzada ──────────────────────────────────────────
  search(filters: SearchFilters): void {
    this.loading.set(true);
    this.error.set(null);
    this.searchMode.set(true);

    // Si hay título y solo título -> searchMovies directo
    if (filters.title && !filters.genreId && !filters.directorName && !filters.actorName) {
      this.http.get<MoviesResponse>(`${this.base}/search/movie`, {
        params: this.p({ query: filters.title }),
      }).subscribe({
        next: res => { this.movies.set(res.results); this.loading.set(false); },
        error: () => { this.error.set('Error al buscar'); this.loading.set(false); },
      });
      return;
    }

    // Resolver IDs de persona (director y/o actor en paralelo)
    const directorId$ = filters.directorName // $ = observable 
      ? this.findPerson(filters.directorName, 'Directing') // si hay directorName se llama a findPerson para buscar su ID
      : of(null);
    const actorId$ = filters.actorName
      ? this.findPerson(filters.actorName, 'Acting')
      : of(null);

    forkJoin([directorId$, actorId$]).pipe(
      switchMap(([directorId, actorId]) => { // Si mientras espera llega una nueva búsqueda, cancela la anterior. y luego ejecuta la función con esos resultados. Si durante la espera llega una nueva búsqueda, switchMap cancela la anterior y empieza de nuevo con la nueva búsqueda, evitando así resultados desactualizados.
        let params = this.p({ sort_by: 'popularity.desc' });
        if (filters.genreId)  params = params.set('with_genres', filters.genreId);
        if (directorId)       params = params.set('with_crew',   directorId);
        if (actorId)          params = params.set('with_cast',   actorId);
        // Título combinado con discover(actor, genero, director) -> filtro de texto TMDB
        if (filters.title)    params = params.set('with_text_query', filters.title);
        return this.http.get<MoviesResponse>(`${this.base}/discover/movie`, { params });
      })
    ).subscribe({
      next: res => { this.movies.set(res.results); this.loading.set(false); },
      error: () => { this.error.set('Error en la búsqueda'); this.loading.set(false); },
    });
  }

  private findPerson(name: string, department: string): Observable<number | null> {
    return this.http.get<PersonSearchResponse>(`${this.base}/search/person`, {
      params: this.p({ query: name }),
    }).pipe(
      map(res => {
        const match = res.results.find(p => p.known_for_department === department) // known for department es el campo que TMDB usa para indicar el departamento principal de una persona
          ?? res.results[0];
        return match ? match.id : null;
      })
    );
  }

  // ── Detalle / créditos / keywords ─────────────────────────────
  getMovieDetails(id: number): Observable<MovieDetails> {
    return this.http.get<MovieDetails>(`${this.base}/movie/${id}`, { params: this.p() });
  }

  getMovieCredits(id: number): Observable<MovieCredits> {
    return this.http.get<MovieCredits>(`${this.base}/movie/${id}/credits`, { params: this.p() });
  }

  getMovieKeywords(id: number): Observable<MovieKeywords> {
    return this.http.get<MovieKeywords>(`${this.base}/movie/${id}/keywords`, { params: this.p() });
  }
}
