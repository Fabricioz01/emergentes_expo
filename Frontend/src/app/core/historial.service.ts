import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HistorialFacultad {
  id: string;
  facultad_id: string;
  facultad_nombre: string;
  temperatura: number;
  fecha: Date;
  sensor_id: string;
  ubicacion: string;
}

export interface EstadisticasFacultad {
  facultad_id: string;
  facultad_nombre: string;
  promedio: number;
  temperatura_minima: number;
  temperatura_maxima: number;
  total_mediciones: number;
  ultima_medicion: Date;
  alertas_generadas: number;
}

export interface ResumenFacultades {
  total_facultades: number;
  facultades_activas: number;
  promedio_general: number;
  alertas_totales: number;
  ultima_actualizacion: Date;
}

@Injectable({
  providedIn: 'root',
})
export class HistorialService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Obtener historial completo por facultad
  obtenerHistorialPorFacultad(
    facultadId: string,
    limit: number = 50
  ): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/historial/facultad/${facultadId}?limit=${limit}`
    );
  }

  // Obtener historial de todas las facultades
  obtenerHistorialGeneral(limit: number = 100): Observable<any> {
    return this.http.get(`${this.apiUrl}/historial/general?limit=${limit}`);
  }

  // Obtener estadísticas por facultad
  obtenerEstadisticasFacultad(facultadId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/historial/estadisticas/${facultadId}`);
  }

  // Obtener estadísticas de todas las facultades
  obtenerEstadisticasTodasFacultades(): Observable<any> {
    return this.http.get(`${this.apiUrl}/historial/estadisticas/todas`);
  }

  // Obtener resumen general
  obtenerResumenGeneral(): Observable<any> {
    return this.http.get(`${this.apiUrl}/historial/resumen`);
  }

  // Obtener historial por rango de fechas
  obtenerHistorialPorFechas(
    fechaInicio: string,
    fechaFin: string,
    facultadId?: string
  ): Observable<any> {
    let url = `${this.apiUrl}/historial/rango?inicio=${fechaInicio}&fin=${fechaFin}`;
    if (facultadId) {
      url += `&facultad=${facultadId}`;
    }
    console.log('🌐 Llamando a URL:', url);
    return this.http.get(url);
  }

  // Exportar datos de historial
  exportarHistorial(
    facultadId?: string,
    formato: 'csv' | 'json' = 'json'
  ): Observable<any> {
    let url = `${this.apiUrl}/historial/exportar?formato=${formato}`;
    if (facultadId) {
      url += `&facultad=${facultadId}`;
    }
    return this.http.get(url);
  }
}
