import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

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
  private http = inject(HttpClient);

  step = signal<Step>('username'); // se inicializa a username
  hidePassword = signal(true);
  errorMsg = signal('');

  usernameForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
  });

  passwordForm = this.fb.group({ 
    password: ['', [Validators.required, Validators.minLength(1)]], 
  });

  submitUsername(): void {
    if (this.usernameForm.invalid) return; // es invalido si el campo username está vacío o tiene menos de 3 caracteres
    this.step.set('loading'); // Cambia el estado a 'loading' para mostrar el spinner de carga mientras se verifica el usuario
    this.errorMsg.set(''); // Limpia cualquier mensaje de error previo antes de intentar verificar el usuario
    const username = this.usernameForm.value.username!; // extrae username, ya sabemos que no es "" asi que metemos el ! para decirle a TypeScript que no es null ni undefined
    this.http.post<{ ok: boolean }>(`${environment.sgeApiUrl}/verificar-usuario`, { username }).subscribe({ // Realiza una solicitud POST al endpoint de verificación de usuario con el nombre de usuario proporcionado. Se espera una respuesta con un objeto que tiene una propiedad 'ok' de tipo booleano.
      next: () => this.step.set('password'), // Si la solicitud es exitosa, cambia el estado a 'password' para mostrar el formulario de contraseña
      error: err => { // Si la solicitud falla, muestra un mensaje de error.        El mensaje se extrae de err.error.detail si está disponible, o se muestra un mensaje genérico 'Usuario no encontrado' si no hay detalles específicos en el error.
        const msg = err.error?.detail ?? 'Usuario no encontrado';
        this.errorMsg.set(msg);
        this.step.set('username');
      },
    });
  }

  submitPassword(): void {
    if (this.passwordForm.invalid) return;                          // invalid es una propiedad de FormGroup que indica si el formulario es válido o no, basado en las validaciones definidas en los controles del formulario. Si el formulario no es válido, se detiene la ejecución de la función y no se intenta iniciar sesión.
    const username = this.usernameForm.value.username!;             // El signo de exclamación indica que estamos seguros de que el valor no es null o undefined
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
