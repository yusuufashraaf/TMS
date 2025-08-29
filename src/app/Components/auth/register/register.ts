import { Component, signal } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../Services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register {
  signupForm: FormGroup;
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isLoading = signal(false);

  notification = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error',
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(12)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  passwordMatchValidator(form: any) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }

    if (confirmPassword && confirmPassword.errors) {
      delete confirmPassword.errors['mismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }

    return null;
  }

  togglePassword() {
    this.showPassword.update((show) => !show);
  }

  toggleConfirmPassword() {
    this.showConfirmPassword.update((show) => !show);
  }

  showNotificationMessage(
    message: string,
    type: 'success' | 'error' = 'success'
  ) {
    this.notification = { show: true, message, type };

    setTimeout(() => {
      this.notification.show = false;
    }, 5000);
  }

  onSubmit() {
    if (!this.signupForm.valid) {
      Object.keys(this.signupForm.controls).forEach((key) => {
        const control = this.signupForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isLoading.set(true);

    const formValue = { ...this.signupForm.value };
    delete formValue.confirmPassword;

    this.authService.register(formValue).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        this.showNotificationMessage(
          'Account created successfully!',
          'success'
        );

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        const message =
          err?.error?.message || 'Registration failed. Please try again.';
        this.showNotificationMessage(message, 'error');
      },
    });
  }

  onLoginClick() {
    this.router.navigate(['/login']);
  }
}
