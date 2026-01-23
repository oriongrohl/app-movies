import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Movie, MoviesResponse } from "../interfaces/movies-interface";

@Injectable ({
    providedIn: 'root'
})
export class MoviesService {
    public listadoMovies: Movie[] = [];
    private readonly baseUrl = 'https://api.themoviedb.org/3';
    private apiKey: string = '414e33485527832fe1033c99b37a827a'
    private currentPage = 1;
    private readonly MAX_PAGES = 500;


    constructor( private http: HttpClient){}

    loadMovies() {
    if (this.currentPage > this.MAX_PAGES) return;

    this.http.get<MoviesResponse>(
      `${this.baseUrl}/discover/movie`,
      {
        params: {
          api_key: this.apiKey,
          page: this.currentPage
        }
      }
    ).subscribe({
      next: (response) => {
        this.listadoMovies = [
          ...this.listadoMovies,
          ...response.results
        ];
        this.currentPage++;
      },
      error: (err) => {
        console.error('Error cargando películas', err);
      }
    });
  }

}