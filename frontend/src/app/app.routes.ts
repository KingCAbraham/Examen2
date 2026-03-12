import { Routes } from '@angular/router';
import { ListaVehiculosComponent } from './components/lista-vehiculos/lista-vehiculos.component';
import { DetalleMantenimientoComponent } from './components/detalle-mantenimiento/detalle-mantenimiento.component';
import { NuevoRegistroComponent } from './components/nuevo-registro/nuevo-registro.component';
import { RegistrarVehiculoComponent } from './components/registrar-vehiculo/registrar-vehiculo.component';
import { EditarVehiculoComponent } from './components/editar-vehiculo/editar-vehiculo.component';
import { LoginComponent } from './components/login/login.component';
import { ClientesComponent } from './components/clientes/clientes.component';
import { InventarioComponent } from './components/inventario/inventario.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/vehiculos', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'vehiculos', component: ListaVehiculosComponent, canActivate: [authGuard] },
    { path: 'vehiculos/nuevo', component: RegistrarVehiculoComponent, canActivate: [authGuard] },
    { path: 'vehiculos/editar/:id', component: EditarVehiculoComponent, canActivate: [authGuard] },
    { path: 'vehiculo/:id/mantenimientos', component: DetalleMantenimientoComponent, canActivate: [authGuard] },
    { path: 'vehiculo/:id/nuevo-registro', component: NuevoRegistroComponent, canActivate: [authGuard] },
    { path: 'clientes', component: ClientesComponent, canActivate: [authGuard] },
    { path: 'inventario', component: InventarioComponent, canActivate: [authGuard] },
    { path: 'usuarios', component: UsuariosComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: '/vehiculos' } // Ruta por defecto para 404
];
