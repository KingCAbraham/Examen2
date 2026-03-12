import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select'; // OBLIGATORIO PARA SELECTORES
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { VehiculoService } from '../../services/vehiculo.service';
import { ClienteService } from '../../services/cliente.service'; // IMPORTADO
import { Vehiculo } from '../../models/vehiculo';

@Component({
  selector: 'app-editar-vehiculo',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatSelectModule
  ],
  templateUrl: './editar-vehiculo.component.html',
  styleUrl: './editar-vehiculo.component.css'
})
export class EditarVehiculoComponent implements OnInit {
  vehiculoForm!: FormGroup;
  vehiculoId!: number;
  cargando = true;
  clientes: any[] = []; // Array para almacenar al catálogo de clientes

  constructor(
    private fb: FormBuilder,
    private vehiculoService: VehiculoService,
    private clienteService: ClienteService, // Inyectado
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.vehiculoId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForm();
    this.cargarClientes(); // Cargar la lista primero
    this.cargarVehiculo();
  }

  initForm(): void {
    this.vehiculoForm = this.fb.group({
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      anio: [new Date().getFullYear(), [Validators.required, Validators.min(1900)]],
      vin: ['', [Validators.required, Validators.minLength(17), Validators.maxLength(17)]],
      placas: ['', Validators.required],
      cliente_id: ['', Validators.required] 
    });
  }

  cargarClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (data) => {
        this.clientes = data;
      },
      error: (err) => console.error('Error al cargar clientes', err)
    });
  }

  cargarVehiculo(): void {
    this.vehiculoService.getVehiculoById(this.vehiculoId).subscribe({
      next: (v) => {
        this.vehiculoForm.patchValue(v);
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar vehículo', err);
        this.snackBar.open('Error al cargar los datos del vehículo', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/vehiculos']);
      }
    });
  }

  onSubmit(): void {
    if (this.vehiculoForm.valid) {
      const vehiculoActualizado: Vehiculo = {
        ...this.vehiculoForm.value,
        id: this.vehiculoId
      };

      this.vehiculoService.updateVehiculo(this.vehiculoId, vehiculoActualizado).subscribe({
        next: () => {
          this.snackBar.open('Vehículo actualizado correctamente', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/vehiculos']);
        },
        error: (err) => {
          console.error('Error al actualizar', err);
          this.snackBar.open('Error al actualizar el vehículo', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }
}

