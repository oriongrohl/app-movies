import { Component } from '@angular/core';
import { MoviesService } from '../../services/movies';
import { Movie } from '../../interfaces/movies-interface';
import { AsyncPipe } from '@angular/common';


@Component({
  selector: 'app-home-page',
  imports: [AsyncPipe], // PARA PODER USAR EL ASYNC PIPE EN EL HTML
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  constructor(private moviesService: MoviesService) {}

  ngOnInit(): void {
    this.moviesService.loadMovies(); // AQUÍ se dispara la request
  }

  get movies(): Movie[] {
    return this.moviesService.listadoMovies;
  }
}
