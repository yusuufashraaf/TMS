import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../Services/auth.service';

export const authGuardGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.currentUser.value;

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  if (user.role === 'Admin') {
    router.navigate(['/dashboard']);
    return false;
  } else {
    router.navigate(['/tasks']);
    return false;
  }
};
