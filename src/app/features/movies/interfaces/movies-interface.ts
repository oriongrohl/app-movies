export interface Movie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  original_language: string;
}

export interface MovieDetails extends Movie {
  genres: { id: number; name: string }[];
  runtime: number;
  tagline: string;
  homepage: string | null;
  status: string;
  budget: number;
  revenue: number;
  original_language: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface MovieCredits {
  id: number;
  cast: CastMember[];
}

export interface MovieKeywords {
  id: number;
  keywords: { id: number; name: string }[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface PersonResult {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
}

export interface PersonSearchResponse {
  results: PersonResult[];
}

export interface MoviesResponse {
  page?: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}
