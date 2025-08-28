import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Login } from './Components/auth/login/login';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Login, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'TMS';
}
