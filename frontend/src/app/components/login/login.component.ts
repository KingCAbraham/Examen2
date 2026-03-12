import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  cargando = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Si ya tiene sesión, redirigir directo
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/vehiculos']);
    }

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.cargando = true;
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          this.cargando = false;
          this.snackBar.open('Bienvenido al sistema', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/vehiculos']);
        },
        error: (err) => {
          this.cargando = false;
          console.error('Error login', err);
          this.snackBar.open('Credenciales inválidas. Verifica tu usuario y contraseña.', 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
        }
      });
    }
  }
}
