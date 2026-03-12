import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Mantenimiento } from '../../models/mantenimiento';
import { Vehiculo } from '../../models/vehiculo';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { VehiculoService } from '../../services/vehiculo.service';

@Component({
  selector: 'app-detalle-mantenimiento',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatDividerModule],
  templateUrl: './detalle-mantenimiento.component.html',
  styleUrl: './detalle-mantenimiento.component.css'
})
export class DetalleMantenimientoComponent implements OnInit {
  vehiculo: Vehiculo | undefined;
  mantenimientos: Mantenimiento[] = [];
  vehiculoId!: number;

  constructor(
    private route: ActivatedRoute,
    private vehiculoService: VehiculoService,
    private mantenimientoService: MantenimientoService
  ) { }

  ngOnInit(): void {
    this.vehiculoId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.vehiculoService.getVehiculoById(this.vehiculoId).subscribe((data: Vehiculo | undefined) => {
      this.vehiculo = data;
    });

    this.mantenimientoService.getMantenimientosByVehiculo(this.vehiculoId).subscribe((data: Mantenimiento[]) => {
      this.mantenimientos = data;
    });
  }
}
