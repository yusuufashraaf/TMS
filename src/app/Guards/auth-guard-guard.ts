import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../Services/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuardGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.currentUser.pipe(
    take(1), // take the latest value
    map((user) => {
      // rebuild from localStorage if needed
      if (!user) {
        const stored = localStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          auth.currentUser.next(parsed);
          user = parsed;
        }
      }

      if (!user) {
        router.navigate(['/login']);
        return false;
      }

      if (state.url === '/dashboard' && user.role !== 'Admin') {
        router.navigate(['/tasks']);
        return false;
      }

      return true;
    })
  );
};
