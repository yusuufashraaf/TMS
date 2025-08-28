import { Routes } from '@angular/router';
import { Login } from './Components/auth/login/login';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./Components/auth/login/login').then((m) => m.Login),
  },
  { path: '**', redirectTo: 'login' },
];
