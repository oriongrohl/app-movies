import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Movie } from '../interfaces/movies-interface';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.sgeApiUrl;

  favoriteIds = signal<number[]>([]);

  loadFavorites(): void {
    this.http.get<number[]>(`${this.api}/favoritas`).subscribe({
      next: ids => this.favoriteIds.set(ids),
      error: () => this.favoriteIds.set([]),
    });
  }

  isFavorite(movieId: number): boolean {
    return this.favoriteIds().includes(movieId);
  }

  toggle(movie: Movie): Observable<boolean> {
    if (this.isFavorite(movie.id)) {
      return this.remove(movie.id).pipe(map(() => false));
    }
    return this.add(movie.id).pipe(map(() => true));
  }

  add(movieId: number): Observable<boolean> {
    return this.http.post<boolean>(`${this.api}/favoritas`, { id_movie: movieId }).pipe(
      tap(() => {
        if (!this.favoriteIds().includes(movieId)) {
          this.favoriteIds.update(ids => [...ids, movieId]); // ... es para crear un nuevo array con el nuevo id añadido, evitando mutar el array original lo cual seria problemático para la detección de cambios en Angular
        }
      })
    );
  }

  remove(movieId: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.api}/favoritas/${movieId}`).pipe(
      tap(() => this.favoriteIds.update(ids => ids.filter(id => id !== movieId)))
    );
  }
}
