import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Vehiculo } from '../models/vehiculo';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class VehiculoService {

    private apiUrl = '/api/vehiculos';

    constructor(private http: HttpClient) { }

    getVehiculos(): Observable<Vehiculo[]> {
        return this.http.get<Vehiculo[]>(this.apiUrl);
    }

    getVehiculoById(id: number): Observable<Vehiculo> {
        return this.http.get<Vehiculo>(`${this.apiUrl}/${id}`);
    }

    createVehiculo(vehiculo: Vehiculo): Observable<Vehiculo> {
        return this.http.post<Vehiculo>(this.apiUrl, vehiculo);
    }

    updateVehiculo(id: number, vehiculo: Vehiculo): Observable<Vehiculo> {
        return this.http.put<Vehiculo>(`${this.apiUrl}/${id}`, vehiculo);
    }

    deleteVehiculo(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
