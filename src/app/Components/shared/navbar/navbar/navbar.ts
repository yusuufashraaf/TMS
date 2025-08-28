import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../../../Services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnDestroy {
  activeRoute: string = 'dashboard';
  isMobileMenuOpen: boolean = false;
  private routerSubscription: Subscription = new Subscription();

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.setActiveRouteFromUrl(this.router.url);

    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.setActiveRouteFromUrl(event.urlAfterRedirects);
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
  }

  setActiveRoute(route: string): void {
    this.activeRoute = route;
    this.closeMobileMenu();
  }

  private setActiveRouteFromUrl(url: string): void {
    const route = url.split('/')[1] || 'dashboard';
    this.activeRoute = route;
  }

  onLogout(): void {
    // Use AuthService to logout
    this.authService.logout();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }
}
