import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService, User } from '../../../../Services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar implements OnInit, OnDestroy {
  activeRoute: string = 'dashboard';
  isMobileMenuOpen: boolean = false;

  currentUser: User | null = null;
  private subscriptions: Subscription = new Subscription();

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to currentUser changes
    const userSub = this.authService.currentUser.subscribe((user) => {
      this.currentUser = user;
    });
    this.subscriptions.add(userSub);

    // Track route changes for active link
    const routeSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.setActiveRouteFromUrl(event.urlAfterRedirects);
      });
    this.subscriptions.add(routeSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  setActiveRoute(route: string): void {
    this.activeRoute = route;
    this.closeMobileMenu();
  }

  private setActiveRouteFromUrl(url: string): void {
    const route = url.split('/')[1] || 'dashboard';
    this.activeRoute = route;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  onLogout(): void {
    this.authService.logout();
  }

  // Helper properties for template
  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'Admin';
  }
}
