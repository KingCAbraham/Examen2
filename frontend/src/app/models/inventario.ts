export interface Inventario {
    id?: number;
    sku: string;
    nombre_pieza: string;
    descripcion?: string;
    cantidad_stock: number;
    precio_unitario: number;
    categoria?: string;
}
