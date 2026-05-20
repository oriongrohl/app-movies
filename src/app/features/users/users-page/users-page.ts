import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from '../../../../environments/environment';

export interface UsuarioSGE {
  id_usuario: number;
  usuario: string;
  nombre_publico: string | null;
  habilitado: number;
  rol: string;
}

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './users-page.html',
  styleUrl: './users-page.css',
})
export class UsersPageComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  private readonly api = environment.sgeApiUrl;

  users = signal<UsuarioSGE[]>([]);
  loading = signal(true);
  editingUser = signal<UsuarioSGE | null>(null);
  showCreateForm = signal(false);

  displayedColumns = ['usuario', 'nombre_publico', 'rol', 'habilitado', 'acciones'];

  createForm = this.fb.group({
    usuario: ['', [Validators.required, Validators.minLength(3)]],
    pass_user: ['', [Validators.required, Validators.minLength(4)]],
    nombre_publico: [''],
    rol: ['user', Validators.required],
    habilitado: [1, Validators.required],
  });

  editForm = this.fb.group({
    nombre_publico: [''],
    rol: ['user', Validators.required],
    habilitado: [1, Validators.required],
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.http.get<UsuarioSGE[]>(`${this.api}/usuarios`).subscribe({
      next: users => { this.users.set(users); this.loading.set(false); },
      error: () => { this.snackBar.open('Error al cargar usuarios', 'Cerrar', { duration: 3000 }); this.loading.set(false); },
    });
  }

  startCreate(): void {
    this.showCreateForm.set(true);
    this.editingUser.set(null);
    this.createForm.reset({ rol: 'user', habilitado: 1 });
  }

  cancelCreate(): void {
    this.showCreateForm.set(false);
    this.createForm.reset();
  }

  submitCreate(): void {
    if (this.createForm.invalid) return;
    this.http.post<UsuarioSGE>(`${this.api}/usuarios`, this.createForm.value).subscribe({
      next: user => {
        this.users.update(u => [...u, user]);
        this.cancelCreate();
        this.snackBar.open('Usuario creado correctamente', 'Cerrar', { duration: 3000 });
      },
      error: err => this.snackBar.open(err.error?.detail ?? 'Error al crear usuario', 'Cerrar', { duration: 3000 }),
    });
  }

  startEdit(user: UsuarioSGE): void {
    this.editingUser.set(user);
    this.showCreateForm.set(false);
    this.editForm.setValue({
      nombre_publico: user.nombre_publico ?? '',
      rol: user.rol,
      habilitado: user.habilitado,
    });
  }

  cancelEdit(): void {
    this.editingUser.set(null);
  }

  submitEdit(): void {
    const user = this.editingUser();
    if (!user || this.editForm.invalid) return;
    this.http.put<UsuarioSGE>(`${this.api}/usuarios/${user.id_usuario}`, this.editForm.value).subscribe({
      next: updated => {
        this.users.update(us => us.map(u => u.id_usuario === updated.id_usuario ? updated : u));
        this.cancelEdit();
        this.snackBar.open('Usuario actualizado', 'Cerrar', { duration: 3000 });
      },
      error: err => this.snackBar.open(err.error?.detail ?? 'Error al actualizar', 'Cerrar', { duration: 3000 }),
    });
  }

  deleteUser(user: UsuarioSGE): void {
    if (!confirm(`¿Eliminar el usuario "${user.usuario}"?`)) return;
    this.http.delete(`${this.api}/usuarios/${user.id_usuario}`).subscribe({
      next: () => {
        this.users.update(us => us.filter(u => u.id_usuario !== user.id_usuario));
        this.snackBar.open('Usuario eliminado', 'Cerrar', { duration: 3000 });
      },
      error: err => this.snackBar.open(err.error?.detail ?? 'Error al eliminar', 'Cerrar', { duration: 3000 }),
    });
  }
}
