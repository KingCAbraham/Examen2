import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select'; // OBLIGATORIO PARA SELECTORES
import { VehiculoService } from '../../services/vehiculo.service';
import { ClienteService } from '../../services/cliente.service'; // IMPORTADO

@Component({
  selector: 'app-registrar-vehiculo',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSelectModule
  ],
  templateUrl: './registrar-vehiculo.component.html',
  styleUrl: './registrar-vehiculo.component.css'
})
export class RegistrarVehiculoComponent implements OnInit {
  vehiculoForm!: FormGroup;
  clientes: any[] = []; // Array para almacenar al catálogo de clientes

  constructor(
    private fb: FormBuilder,
    private vehiculoService: VehiculoService,
    private clienteService: ClienteService, // Inyectado
    private router: Router
  ) { }

  ngOnInit(): void {
    // Inicializar formulario con 'cliente_id' en lugar de 'cliente'
    this.vehiculoForm = this.fb.group({
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      anio: [new Date().getFullYear(), [Validators.required, Validators.min(1900)]],
      vin: ['', [Validators.required, Validators.minLength(17), Validators.maxLength(17)]],
      placas: ['', Validators.required],
      cliente_id: ['', Validators.required] 
    });

    // Cargar clientes desde la BD
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (data) => {
        this.clientes = data;
      },
      error: (err) => console.error('Error al cargar clientes', err)
    });
  }

  onSubmit(): void {
    if (this.vehiculoForm.valid) {
      this.vehiculoService.createVehiculo(this.vehiculoForm.value).subscribe({
        next: () => {
          this.router.navigate(['/vehiculos']);
        },
        error: (err) => console.error('Error al registrar vehículo', err)
      });
    }
  }
}

