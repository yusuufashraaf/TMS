import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';

export const loginGuardGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // Redirect logged-in users to dashboard
    router.navigate(['/dashboard']);
    return false;
  }

  // Allow access if not logged in
  return true;
};
