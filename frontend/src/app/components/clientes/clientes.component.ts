import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../models/cliente';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatTableModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatSnackBarModule, MatTooltipModule
  ],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ClientesComponent implements OnInit {
  clienteService = inject(ClienteService);
  fb = inject(FormBuilder);
  snackBar = inject(MatSnackBar);

  clientes: Cliente[] = [];
  displayedColumns: string[] = ['nombre', 'telefono', 'email', 'acciones'];
  
  mostrarFormulario = false;
  clienteForm!: FormGroup;
  guardando = false;
  editingClienteId: number | null = null;

  ngOnInit(): void {
    this.cargarClientes();
    this.initForm();
  }

  initForm() {
    this.clienteForm = this.fb.group({
      nombre_completo: ['', Validators.required],
      telefono: [''],
      email: ['', Validators.email],
      direccion: ['']
    });
  }

  cargarClientes() {
    this.clienteService.getClientes().subscribe({
      next: (data) => {
        this.clientes = data;
      },
      error: (err) => console.error('Error al cargar clientes', err)
    });
  }

  toggleForm() {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.clienteForm.reset();
      this.editingClienteId = null;
    }
  }

  editarCliente(cliente: Cliente) {
    this.editingClienteId = cliente.id!;
    this.clienteForm.patchValue({
      nombre_completo: cliente.nombre_completo,
      telefono: cliente.telefono,
      email: cliente.email,
      direccion: cliente.direccion
    });
    this.mostrarFormulario = true;
  }

  eliminarCliente(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente? Se podrían perder asociaciones con sus vehículos.')) {
      this.clienteService.deleteCliente(id).subscribe({
        next: () => {
          this.clientes = this.clientes.filter(c => c.id !== id);
          this.snackBar.open('Cliente eliminado del sistema', 'Cerrar', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error al eliminar cliente', err);
          this.snackBar.open('Error al eliminar cliente', 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
        }
      });
    }
  }

  onSubmit() {
    if (this.clienteForm.valid) {
      this.guardando = true;
      if (this.editingClienteId) {
        this.clienteService.updateCliente(this.editingClienteId, this.clienteForm.value).subscribe({
          next: (clienteAct) => {
            const index = this.clientes.findIndex(c => c.id === this.editingClienteId);
            if (index !== -1) {
              this.clientes[index] = clienteAct;
              this.clientes = [...this.clientes];
            }
            this.guardando = false;
            this.toggleForm();
            this.snackBar.open('Cliente actualizado exitosamente', 'Cerrar', { duration: 3000 });
          },
          error: (err) => {
            console.error('Error al actualizar cliente', err);
            this.guardando = false;
            this.snackBar.open('Error al actualizar cliente', 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
          }
        });
      } else {
        this.clienteService.createCliente(this.clienteForm.value).subscribe({
          next: (nuevoCliente) => {
            this.clientes = [...this.clientes, nuevoCliente];
            this.guardando = false;
            this.toggleForm();
            this.snackBar.open('Cliente registrado exitosamente', 'Cerrar', { duration: 3000 });
          },
          error: (err) => {
            console.error('Error al crear cliente', err);
            this.guardando = false;
            this.snackBar.open('Error al registrar cliente', 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
          }
        });
      }
    }
  }
}
