import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  LecturaTemperatura, 
  EstadisticasTemperatura, 
  EstadoSensor,
  ApiResponse 
} from '../models/temperatura.interface';

@Injectable({
  providedIn: 'root'
})
export class TemperaturaService {
  private readonly baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Obtener todas las lecturas
  obtenerLecturas(): Observable<ApiResponse<LecturaTemperatura[]>> {
    return this.http.get<ApiResponse<LecturaTemperatura[]>>(`${this.baseUrl}/temperatura`);
  }

  // Crear nueva lectura
  crearLectura(lectura: Omit<LecturaTemperatura, 'id'>): Observable<ApiResponse<LecturaTemperatura>> {
    return this.http.post<ApiResponse<LecturaTemperatura>>(`${this.baseUrl}/temperatura`, lectura);
  }

  // Obtener estadísticas
  obtenerEstadisticas(): Observable<ApiResponse<EstadisticasTemperatura>> {
    return this.http.get<ApiResponse<EstadisticasTemperatura>>(`${this.baseUrl}/temperatura/estadisticas`);
  }

  // Control del sensor
  iniciarSensor(): Observable<ApiResponse<EstadoSensor>> {
    return this.http.post<ApiResponse<EstadoSensor>>(`${this.baseUrl}/sensor/iniciar`, {});
  }

  detenerSensor(): Observable<ApiResponse<EstadoSensor>> {
    return this.http.post<ApiResponse<EstadoSensor>>(`${this.baseUrl}/sensor/detener`, {});
  }

  obtenerEstadoSensor(): Observable<ApiResponse<EstadoSensor>> {
    return this.http.get<ApiResponse<EstadoSensor>>(`${this.baseUrl}/sensor/estado`);
  }

  // Limpiar datos
  limpiarDatos(): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/temperatura`);
  }
}
