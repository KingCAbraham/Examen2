export interface Usuario {
    id?: number;
    username: string;
    password?: string; // Solo se usa al registrar, nunca debe volver del backend
    rol: string;
    fecha_creacion?: Date;
}
