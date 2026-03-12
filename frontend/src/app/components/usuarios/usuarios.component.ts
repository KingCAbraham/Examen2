import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatTableModule, MatFormFieldModule, MatInputModule, 
    MatSelectModule, MatSnackBarModule
  ],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {
  usuarioService = inject(UsuarioService);
  authService = inject(AuthService);
  fb = inject(FormBuilder);
  snackBar = inject(MatSnackBar);

  usuarios: Usuario[] = [];
  displayedColumns: string[] = ['id', 'username', 'rol', 'fecha_creacion', 'status', 'acciones'];
  
  mostrarFormulario = false;
  usuarioForm!: FormGroup;
  guardando = false;

  roles = [
    { value: 'admin', viewValue: 'Administrador (Acceso Total)' },
    { value: 'mecanico', viewValue: 'Técnico / Mecánico' }
  ];

  ngOnInit(): void {
    // Si no es admin, no debería poder ver ni usar esto, pero el guard lo protege en la ruta.
    this.cargarUsuarios();
    this.initForm();
  }

  initForm() {
    this.usuarioForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['mecanico', Validators.required]
    });
  }

  cargarUsuarios() {
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
      },
      error: (err) => console.error('Error al cargar usuarios', err)
    });
  }

  toggleForm() {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.usuarioForm.reset({ rol: 'mecanico' });
    }
  }

  eliminarUsuario(id: number) {
    if (confirm('¿Estás seguro de que deseas revocar permanentemente el acceso a este miembro corporativo?')) {
      this.usuarioService.deleteUsuario(id).subscribe({
        next: () => {
          this.usuarios = this.usuarios.filter(u => u.id !== id);
          this.snackBar.open('Acceso revocado exitosamente', 'Cerrar', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error al revocar usuario', err);
          this.snackBar.open('Error al dar de baja servidor', 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
        }
      });
    }
  }

  onSubmit() {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      this.snackBar.open('Por favor revisa los datos: mínimo 4 letras para Usuario y 6 para Contraseña.', 'Cerrar', { duration: 5000, panelClass: ['error-snackbar'] });
      return;
    }
    
    this.guardando = true;
    this.usuarioService.createUsuario(this.usuarioForm.value).subscribe({
      next: (res) => {
        // El backend devuelve { message, user }
        this.usuarios = [...this.usuarios, res.user];
        this.guardando = false;
        this.toggleForm();
        this.snackBar.open('Usuario creado exitosamente. La contraseña fue encriptada.', 'Cerrar', { duration: 4000 });
      },
      error: (err) => {
        console.error('Error al registrar usuario', err);
        this.guardando = false;
        const msg = err.error?.message || 'Error al guardar usuario';
        this.snackBar.open(msg, 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
      }
    });
  }
}
