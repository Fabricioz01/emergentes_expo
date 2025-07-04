export interface LecturaTemperatura {
  _id?: string;
  valor: number;
  fecha: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
}

export interface EstadisticasTemperatura {
  total: number;
  promedio: number;
  maximo: number;
  minimo: number;
  alertas: number;
}

export interface EstadoSensor {
  isRunning: boolean;
  ultimaLectura: number | null;
}
