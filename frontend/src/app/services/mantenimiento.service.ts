import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Mantenimiento } from '../models/mantenimiento';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MantenimientoService {

    private apiUrl = '/api/mantenimientos';

    // Lista de Códigos DTC comunes (se mantienen locales para respuesta inmediata en búsqueda)
    private dtcsMock = [
        { codigo: 'P0171', descripcion: 'Mezcla demasiado pobre (Banco 1)' },
        { codigo: 'P0300', descripcion: 'Fallo de encendido detectado en múltiples cilindros' },
        { codigo: 'P0301', descripcion: 'Fallo de encendido detectado (Cilindro 1)' },
        { codigo: 'P0302', descripcion: 'Fallo de encendido detectado (Cilindro 2)' },
        { codigo: 'P0420', descripcion: 'Eficiencia del sistema de catalizador por debajo del umbral (Banco 1)' },
        { codigo: 'P0113', descripcion: 'Circuito alto de entrada del sensor IAT' },
        { codigo: 'P0101', descripcion: 'Rango/Rendimiento del circuito de masa de aire (MAF)' },
        { codigo: 'P0505', descripcion: 'Mal funcionamiento del sistema de control de ralentí' },
        { codigo: 'P1340', descripcion: 'Sensor de posición de árbol de levas (G40) / Sensor RMP (G28) asignación incorrecta' },
        { codigo: 'C1145', descripcion: 'Sensor de velocidad de rueda ABS delantero derecho - Circuito abierto' }
    ];

    constructor(private http: HttpClient) { }

    getMantenimientos(): Observable<Mantenimiento[]> {
        return this.http.get<Mantenimiento[]>(this.apiUrl);
    }

    getMantenimientoById(id: number): Observable<Mantenimiento> {
        return this.http.get<Mantenimiento>(`${this.apiUrl}/${id}`);
    }

    getMantenimientosByVehiculo(vehiculoId: number): Observable<Mantenimiento[]> {
        return this.http.get<Mantenimiento[]>(`${this.apiUrl}/vehiculo/${vehiculoId}`);
    }

    createMantenimiento(mantenimiento: Mantenimiento): Observable<Mantenimiento> {
        return this.http.post<Mantenimiento>(this.apiUrl, mantenimiento);
    }

    updateMantenimiento(id: number, mantenimiento: Mantenimiento): Observable<Mantenimiento> {
        return this.http.put<Mantenimiento>(`${this.apiUrl}/${id}`, mantenimiento);
    }

    deleteMantenimiento(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    getDTCs(): Observable<any[]> {
        return of([...this.dtcsMock]);
    }
}
