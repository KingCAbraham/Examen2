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
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InventarioService } from '../../services/inventario.service';
import { Inventario } from '../../models/inventario';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatTableModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, 
    MatSnackBarModule, MatTooltipModule
  ],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
export class InventarioComponent implements OnInit {
  inventarioService = inject(InventarioService);
  fb = inject(FormBuilder);
  snackBar = inject(MatSnackBar);

  articulos: Inventario[] = [];
  displayedColumns: string[] = ['sku', 'nombre', 'categoria', 'precio', 'stock', 'acciones'];
  
  mostrarFormulario = false;
  articuloForm!: FormGroup;
  guardando = false;
  editingArticuloId: number | null = null;

  categorias = [
    'Frenos y Suspensión',
    'Filtros y Lubricantes',
    'Eléctrico e Iluminación',
    'Motor e Inyección',
    'Carrocería e Interiores',
    'Herramientas'
  ];

  ngOnInit(): void {
    this.cargarInventario();
    this.initForm();
  }

  initForm() {
    this.articuloForm = this.fb.group({
      sku: ['', [Validators.required, Validators.maxLength(50)]],
      nombre_pieza: ['', [Validators.required, Validators.maxLength(150)]],
      categoria: [''],
      precio_unitario: [0, [Validators.required, Validators.min(0)]],
      cantidad_stock: [0, [Validators.required, Validators.min(0)]],
      descripcion: ['']
    });
  }

  cargarInventario() {
    this.inventarioService.getInventario().subscribe({
      next: (data) => {
        this.articulos = data;
      },
      error: (err) => console.error('Error al cargar inventario', err)
    });
  }

  toggleForm() {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.articuloForm.reset({
        precio_unitario: 0,
        cantidad_stock: 0
      });
      this.editingArticuloId = null;
    }
  }

  editarArticulo(articulo: Inventario) {
    this.editingArticuloId = articulo.id!;
    this.articuloForm.patchValue({
      sku: articulo.sku,
      nombre_pieza: articulo.nombre_pieza,
      categoria: articulo.categoria,
      precio_unitario: articulo.precio_unitario,
      cantidad_stock: articulo.cantidad_stock,
      descripcion: articulo.descripcion
    });
    this.mostrarFormulario = true;
  }

  eliminarArticulo(id: number) {
    if (confirm('¿Estás seguro de que deseas dar de baja esta refacción de tu inventario?')) {
      this.inventarioService.deleteArticulo(id).subscribe({
        next: () => {
          this.articulos = this.articulos.filter(a => a.id !== id);
          this.snackBar.open('Refacción eliminada', 'Cerrar', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error al dar de baja articulo', err);
          this.snackBar.open('Error al borrar', 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
        }
      });
    }
  }

  onSubmit() {
    if (this.articuloForm.valid) {
      this.guardando = true;
      if (this.editingArticuloId) {
        this.inventarioService.updateArticulo(this.editingArticuloId, this.articuloForm.value).subscribe({
          next: (articuloAct) => {
            const index = this.articulos.findIndex(a => a.id === this.editingArticuloId);
            if (index !== -1) {
              this.articulos[index] = articuloAct;
              this.articulos = [...this.articulos];
            }
            this.guardando = false;
            this.toggleForm();
            this.snackBar.open('Refacción actualizada exitosamente', 'Cerrar', { duration: 3000 });
          },
          error: (err) => {
            console.error('Error al actualizar refacción', err);
            this.guardando = false;
            this.snackBar.open('Error al modificar', 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
          }
        });
      } else {
        this.inventarioService.createArticulo(this.articuloForm.value).subscribe({
          next: (nuevoArticulo) => {
            this.articulos = [...this.articulos, nuevoArticulo];
            this.guardando = false;
            this.toggleForm();
            this.snackBar.open('Artículo registrado en inventario', 'Cerrar', { duration: 3000 });
          },
          error: (err) => {
            console.error('Error al registrar artículo', err);
            this.guardando = false;
            this.snackBar.open('Error al guardar artículo', 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
          }
        });
      }
    }
  }

  getStockClass(cantidad: number): string {
    if (cantidad === 0) return 'stock-agotado';
    if (cantidad <= 5) return 'stock-bajo';
    return 'stock-ok';
  }
}
