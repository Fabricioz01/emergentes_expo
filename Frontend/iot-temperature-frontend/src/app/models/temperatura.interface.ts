export interface LecturaTemperatura {
  id?: string;
  temperatura: number;
  fecha: Date;
  ubicacion?: string;
  sensor_id?: string;
}

export interface EstadisticasTemperatura {
  total: number;
  promedio: number;
  minima: number;
  maxima: number;
  alertas: number;
}

export interface EstadoSensor {
  activo: boolean;
  ultima_lectura?: Date;
  total_lecturas: number;
  sensor_id: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
