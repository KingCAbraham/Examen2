import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ViewChild } from '@angular/core';
import { Vehiculo } from '../../models/vehiculo';
import { VehiculoService } from '../../services/vehiculo.service';

@Component({
  selector: 'app-lista-vehiculos',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatTableModule, MatButtonModule,
    MatIconModule, MatInputModule, MatFormFieldModule, MatPaginatorModule,
    MatDialogModule, MatSnackBarModule
  ],
  templateUrl: './lista-vehiculos.component.html',
  styleUrl: './lista-vehiculos.component.css'
})
export class ListaVehiculosComponent implements OnInit {
  dataSource = new MatTableDataSource<Vehiculo>([]);
  columnasMostrar: string[] = ['placas', 'marca', 'modelo', 'anio', 'vin', 'cliente', 'acciones'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private vehiculoService: VehiculoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.cargarVehiculos();
  }

  cargarVehiculos(): void {
    this.vehiculoService.getVehiculos().subscribe((data: Vehiculo[]) => {
      this.dataSource.data = data;
      // Importante: Asignar el paginador después de cargar los datos para forzar el renderizado
      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
      });
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  eliminarVehiculo(id: number): void {
    if (confirm('¿Estas seguro de eliminar este vehículo? Esta acción no se puede deshacer.')) {
      this.vehiculoService.deleteVehiculo(id).subscribe({
        next: () => {
          this.snackBar.open('Vehículo eliminado correctamente', 'Cerrar', { duration: 3000 });
          this.cargarVehiculos();
        },
        error: (err) => {
          console.error('Error al eliminar', err);
          this.snackBar.open('Error al eliminar el vehículo', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }
}
