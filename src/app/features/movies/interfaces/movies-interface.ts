export interface Movie {
    id: number;
    title: string;
    overview: string;
    release_date: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average: number;
    vote_count: number;
}

export interface MovieDetails extends Movie {
    genres: { id: number; name: string }[];
    runtime: number;
    tagline: string;
    homepage: string | null;
}   

export interface MoviesResponse {
    page?: number;
    results: Movie[];
    total_pages: number;
    total_results: number;
}
