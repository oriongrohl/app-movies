import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

type Step = 'username' | 'loading' | 'password';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  step = signal<Step>('username');
  hidePassword = signal(true);
  errorMsg = signal('');

  usernameForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
  });

  passwordForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(1)]],
  });

  submitUsername(): void {
    if (this.usernameForm.invalid) return;
    this.step.set('loading');
    this.errorMsg.set('');
    setTimeout(() => this.step.set('password'), 1200);
  }

  submitPassword(): void {
    if (this.passwordForm.invalid) return;
    const username = this.usernameForm.value.username!;
    const password = this.passwordForm.value.password!;

    this.auth.login(username, password).subscribe({
      next: () => this.router.navigate(['/movies']),
      error: err => {
        const msg = err.error?.detail ?? 'Error al iniciar sesión';
        this.errorMsg.set(msg);
        this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
        this.passwordForm.reset();
      },
    });
  }

  backToUsername(): void {
    this.step.set('username');
    this.passwordForm.reset();
    this.errorMsg.set('');
  }
}
