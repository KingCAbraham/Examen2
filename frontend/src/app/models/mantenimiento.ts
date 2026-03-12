export interface Mantenimiento {
    id?: number;
    vehiculo_id: number;
    fecha: string;
    tipo_servicio: string;
    descripcion_falla: string;
    codigos_falla: string;
    lecturas_multimetro: string;
    voltaje_bateria?: number;
    kilometraje: number;
    trabajo_realizado: string;
    refacciones_utilizadas?: string;
    costo: number;
}
