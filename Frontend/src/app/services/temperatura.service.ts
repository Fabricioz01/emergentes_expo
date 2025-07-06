import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  LecturaTemperatura,
  ApiResponse,
  EstadisticasTemperatura,
  EstadoSensor,
} from '../models/temperatura.interface';

@Injectable({
  providedIn: 'root',
})
export class TemperaturaService {
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Obtener lecturas de temperatura
  obtenerLecturas(
    limite: number = 20
  ): Observable<ApiResponse<LecturaTemperatura[]>> {
    return this.http.get<ApiResponse<LecturaTemperatura[]>>(
      `${this.API_URL}/temperatura?limite=${limite}`
    );
  }

  // Obtener estadísticas
  obtenerEstadisticas(): Observable<ApiResponse<EstadisticasTemperatura>> {
    return this.http.get<ApiResponse<EstadisticasTemperatura>>(
      `${this.API_URL}/temperatura/estadisticas`
    );
  }

  // Crear nueva lectura manual
  crearLectura(valor: number): Observable<ApiResponse<LecturaTemperatura>> {
    return this.http.post<ApiResponse<LecturaTemperatura>>(
      `${this.API_URL}/temperatura`,
      { valor }
    );
  }

  // Limpiar todas las lecturas
  limpiarLecturas(): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/temperatura`);
  }

  // Iniciar sensor
  iniciarSensor(): Observable<ApiResponse<EstadoSensor>> {
    return this.http.post<ApiResponse<EstadoSensor>>(
      `${this.API_URL}/sensor/iniciar`,
      {}
    );
  }

  // Detener sensor
  detenerSensor(): Observable<ApiResponse<EstadoSensor>> {
    return this.http.post<ApiResponse<EstadoSensor>>(
      `${this.API_URL}/sensor/detener`,
      {}
    );
  }

  // Obtener estado del sensor
  obtenerEstadoSensor(): Observable<ApiResponse<EstadoSensor>> {
    return this.http.get<ApiResponse<EstadoSensor>>(
      `${this.API_URL}/sensor/estado`
    );
  }
}
