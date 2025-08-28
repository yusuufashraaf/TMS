import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../Services/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  loginForm: FormGroup;
  isLoading = false;

  notification = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error',
  };

  constructor(private authService: AuthService, private router: Router) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(12),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).*$/),
      ]),
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.valid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    const credentials = this.loginForm.value;

    this.authService
      .login(credentials)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (res) => {
          // Success: navigate and show toast
          this.showNotification('Login successful!', 'success');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          const messages = err?.error?.message;

          // If backend returns array of errors
          if (Array.isArray(messages)) {
            messages.forEach((msg) => {
              if (msg.toLowerCase().includes('email')) {
                this.loginForm.get('email')?.setErrors({ backend: msg });
              } else if (msg.toLowerCase().includes('password')) {
                this.loginForm.get('password')?.setErrors({ backend: msg });
              } else {
                this.showNotification(msg, 'error');
              }
            });
          } else {
            // Single error message
            this.showNotification(
              messages || 'Login failed. Please check your credentials.',
              'error'
            );
          }

          // Mark all fields as touched to display backend errors
          this.markFormGroupTouched();
        },
      });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach((key) => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  onRegister(event: Event): void {
    event.preventDefault();
    this.showNotification('Redirecting to registration page...', 'success');
    this.router.navigate(['/register']);
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    this.notification = { show: true, message, type };

    setTimeout(() => {
      this.notification.show = false;
    }, 5000);
  }
}
