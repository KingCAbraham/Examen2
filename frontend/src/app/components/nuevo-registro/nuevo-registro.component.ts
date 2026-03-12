import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { Mantenimiento } from '../../models/mantenimiento';
import { Vehiculo } from '../../models/vehiculo';
import { VehiculoService } from '../../services/vehiculo.service';

@Component({
  selector: 'app-nuevo-registro',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatDatepickerModule, MatNativeDateModule,
    MatAutocompleteModule, MatSelectModule
  ],
  templateUrl: './nuevo-registro.component.html',
  styleUrl: './nuevo-registro.component.css'
})
export class NuevoRegistroComponent implements OnInit {
  mantenimientoForm!: FormGroup;
  vehiculoId!: number;
  vehiculo?: Vehiculo;

  dtcsTodos: any[] = [];
  dtcsFiltrados!: Observable<any[]>;

  serviciosPredefinidos: string[] = [
    'Afinación Mayor',
    'Cambio de Aceite y Filtro',
    'Diagnóstico con Escáner',
    'Revisión de Frenos',
    'Servicio Eléctrico',
    'Limpieza de Inyectores',
    'Suspensión y Dirección',
    'Sistema de Enfriamiento',
    'Otro'
  ];

  constructor(
    private fb: FormBuilder,
    private mantenimientoService: MantenimientoService,
    private vehiculoService: VehiculoService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.vehiculoId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarVehiculo();
    this.cargarDTCs();
    this.initForm();
  }

  cargarDTCs(): void {
    this.mantenimientoService.getDTCs().subscribe(data => {
      this.dtcsTodos = data;
    });
  }

  cargarVehiculo(): void {
    this.vehiculoService.getVehiculoById(this.vehiculoId).subscribe({
      next: (v) => this.vehiculo = v,
      error: (e) => console.error('Error cargando vehículo', e)
    });
  }

  initForm(): void {
    this.mantenimientoForm = this.fb.group({
      fecha: [{ value: new Date().toLocaleString(), disabled: true }],
      tipo_servicio: ['Diagnóstico General', Validators.required],
      descripcion_falla: ['', Validators.required],
      codigos_falla: [''],
      lecturas_multimetro: [''],
      kilometraje: ['', [Validators.required, Validators.min(0)]],
      voltaje_bateria: ['', [Validators.min(0), Validators.max(20)]],
      trabajo_realizado: ['', Validators.required],
      refacciones_utilizadas: [''],
      costo: [0, [Validators.required, Validators.min(0)]]
    });

    this.dtcsFiltrados = this.mantenimientoForm.get('codigos_falla')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterDTCs(value || ''))
    );
  }

  private _filterDTCs(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.dtcsTodos.filter(dtc =>
      dtc.codigo.toLowerCase().includes(filterValue) ||
      dtc.descripcion.toLowerCase().includes(filterValue)
    );
  }

  onSubmit(): void {
    if (this.mantenimientoForm.valid) {
      const formValue = this.mantenimientoForm.getRawValue();
      const nuevoMantenimiento: Mantenimiento = {
        ...formValue,
        vehiculo_id: this.vehiculoId,
        id: 0,
        fecha: new Date().toISOString() // Fecha automática técnica
      };

      this.mantenimientoService.createMantenimiento(nuevoMantenimiento).subscribe({
        next: () => {
          this.router.navigate(['/vehiculo', this.vehiculoId, 'mantenimientos']);
        },
        error: (err: any) => console.error('Error al guardar', err)
      });
    }
  }
}
