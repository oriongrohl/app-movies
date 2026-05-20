import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Movie } from '../../../features/movies/interfaces/movies-interface';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [RouterLink, SlicePipe, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.css',
})
export class MovieCardComponent {
  movie = input.required<Movie>();
  isFavorite = input(false);
  toggleFavorite = output<Movie>();

  readonly imageBase = environment.tmdbImageBase;
  readonly fallbackImage = 'https://via.placeholder.com/500x750?text=Sin+imagen';

  getImageUrl(): string {
    return this.movie().poster_path
      ? `${this.imageBase}${this.movie().poster_path}`
      : this.fallbackImage;
  }

  getRating(): string {
    return this.movie().vote_average.toFixed(1);
  }

  onToggleFavorite(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.toggleFavorite.emit(this.movie());
  }
}
