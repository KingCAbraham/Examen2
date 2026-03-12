import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Inventario } from '../models/inventario';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private apiUrl = '/api/inventario';

  constructor(private http: HttpClient) { }

  getInventario(): Observable<Inventario[]> {
    return this.http.get<Inventario[]>(this.apiUrl);
  }

  createArticulo(articulo: Inventario): Observable<Inventario> {
    return this.http.post<Inventario>(this.apiUrl, articulo);
  }

  updateArticulo(id: number, articulo: Inventario): Observable<Inventario> {
    return this.http.put<Inventario>(`${this.apiUrl}/${id}`, articulo);
  }

  deleteArticulo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
