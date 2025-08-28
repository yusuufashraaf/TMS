import { Routes } from '@angular/router';
import { Login } from './Components/auth/login/login';
import { Dashboard } from './Components/dashboard/dashboard/dashboard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] },
];
