import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenCheckInterval!: number;
  private baseUrl = 'http://localhost:8000/api/v1/auth';
  public currentUser = new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    // Initialize current user if token exists
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.currentUser.next(JSON.parse(user));
    }

    // Check token periodically
    this.tokenCheckInterval = window.setInterval(() => {
      const tokenExists = !!localStorage.getItem('token');
      if (!tokenExists && this.currentUser.value) {
        this.handleTokenRemoved();
      }
    }, 1000);
  }

  register(data: any) {
    return this.http.post(`${this.baseUrl}/signup`, data);
  }

  login(data: any) {
    return this.http.post(`${this.baseUrl}/login`, data).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        this.currentUser.next(res.data.user);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.next(null);
    clearInterval(this.tokenCheckInterval);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  isAdmin(): boolean {
    const user = this.currentUser.value;
    return user?.role === 'Admin';
  }

  private handleTokenRemoved() {
    this.currentUser.next(null);
    this.router.navigate(['/login']);
  }
}
