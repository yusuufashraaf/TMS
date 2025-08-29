import { Routes } from '@angular/router';
import { Login } from './Components/auth/login/login';
import { Dashboard } from './Components/dashboard/dashboard/dashboard';
import { authGuardGuard } from './Guards/auth-guard-guard';
import { Projects } from './Components/projects/projects/projects';
import { Register } from './Components/auth/register/register';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuardGuard] },
  { path: 'projects', component: Projects, canActivate: [authGuardGuard] },
  { path: 'register', component: Register },
];
