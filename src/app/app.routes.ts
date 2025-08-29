import { Routes } from '@angular/router';
import { Login } from './Components/auth/login/login';
import { Dashboard } from './Components/dashboard/dashboard/dashboard';
import { authGuardGuard } from './Guards/auth-guard-guard';
import { Projects } from './Components/projects/projects/projects';
import { Register } from './Components/auth/register/register';
import { Tasks } from './Components/tasks/tasks/tasks';
import { loginGuardGuard } from './Guards/login-guard-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login, canActivate: [loginGuardGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuardGuard] },
  { path: 'projects', component: Projects, canActivate: [authGuardGuard] },
  { path: 'register', component: Register, canActivate: [loginGuardGuard] },
  { path: 'tasks', component: Tasks, canActivate: [authGuardGuard] },
];
