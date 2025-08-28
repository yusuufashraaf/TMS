import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';
// Export the interface so it can be imported elsewhere
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
  private baseUrl = 'http://localhost:8000/api/v1/auth';
  public currentUser = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient, private router: Router) {}

  register(data: any) {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  login(data: any) {
    return this.http.post(`${this.baseUrl}/login`, data).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.data.token);
        this.currentUser.next(res.user);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUser.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn() {
    return !!localStorage.getItem('token');
  }
}
