import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Movie, MoviesResponse } from "../interfaces/movies-interface";
import { Observable } from "rxjs";

@Injectable ({
    providedIn: 'root'
})
export class MoviesService {
    public listadoMovies: Movie[] = [];
    private readonly baseUrl = 'https://api.themoviedb.org/3';
    private apiKey: string = '414e33485527832fe1033c99b37a827a'
    
    private http = inject(HttpClient); //injecto el HttpClient servicio como una dependencia
    private currentPage = 1;
    private readonly MAX_PAGES = 500;


    loadMovies() {
        this.getMovies(this.currentPage).subscribe((response) => {
            this.listadoMovies = response.results;
        });
    }

    getMovies(page: number): Observable<MoviesResponse> {
        return this.http.get<MoviesResponse>(`/api/movies?page=${page}`);
    }

    getMovieDetails(id: number) {
        return this.http.get(`${this.baseUrl}/movie/${id}?api_key=${this.apiKey}&language=es-MX`);
    }

    searchMovies(query: string, page: number) {
        return this.http.get(`${this.baseUrl}/search/movie?api_key=${this.apiKey}&language=es-MX&query=${query}&page=${page}`);
    }
}

