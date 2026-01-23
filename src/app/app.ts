import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuHeaderComponent } from "./shared/components/menu-header/menu-header";
import { CardListComponent } from './shared/components/card-list/card-list';
import { HomePage } from "./features/movies/pages/home-page/home-page";

@Component({
  selector: 'app-root',
  imports: [MenuHeaderComponent, CardListComponent, HomePage],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('movies');
}
