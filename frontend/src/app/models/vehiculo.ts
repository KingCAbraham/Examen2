export interface Vehiculo {
    id?: number;
    marca: string;
    modelo: string;
    anio: number;
    vin: string;
    placas: string;
    cliente: string; // Se mantiene como string (nombre) para la tabla visual
    cliente_id?: number; // Nueva propiedad numérica necesaria para creación y edición
}
