import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import {
  HistorialService,
  HistorialFacultad,
  EstadisticasFacultad,
  ResumenFacultades,
} from '../../core/historial.service';

Chart.register(...registerables);

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="historial-container">
      <!-- Header -->
      <header class="historial-header">
        <h1>📊 Historial de Mediciones - ULEAM</h1>
        <p>Análisis histórico de temperaturas por facultad</p>
      </header>

      <!-- Filtros -->
      <div class="filtros-section">
        <div class="filtro-grupo">
          <label>Facultad:</label>
          <select
            [(ngModel)]="facultadSeleccionada"
            (change)="cargarHistorial()"
          >
            <option value="">Todas las facultades</option>
            <option *ngFor="let facultad of facultades" [value]="facultad.id">
              {{ facultad.nombre }}
            </option>
          </select>
        </div>

        <div class="filtro-grupo">
          <label>Desde:</label>
          <input
            type="date"
            [(ngModel)]="fechaInicio"
            (change)="cargarHistorial()"
          />
        </div>

        <div class="filtro-grupo">
          <label>Hasta:</label>
          <input
            type="date"
            [(ngModel)]="fechaFin"
            (change)="cargarHistorial()"
          />
        </div>

        <div class="filtro-grupo">
          <button class="btn-filtrar" (click)="aplicarFiltros()">
            🔍 Filtrar
          </button>
          <button class="btn-limpiar" (click)="limpiarFiltros()">
            🗑️ Limpiar
          </button>
          <button class="btn-exportar" (click)="exportarDatos()">
            📥 Exportar
          </button>
        </div>
      </div>

      <!-- Resumen General -->
      <div class="resumen-section" *ngIf="resumenGeneral">
        <div class="stat-card">
          <h3>🏛️ Total Facultades</h3>
          <span class="stat-value">{{ resumenGeneral.total_facultades }}</span>
        </div>
        <div class="stat-card">
          <h3>📈 Promedio General</h3>
          <span class="stat-value"
            >{{ resumenGeneral.promedio_general | number : '1.1-1' }}°C</span
          >
        </div>
        <div class="stat-card">
          <h3>🚨 Total Alertas</h3>
          <span class="stat-value">{{ resumenGeneral.alertas_totales }}</span>
        </div>
        <div class="stat-card">
          <h3>⏰ Última Actualización</h3>
          <span class="stat-value">{{
            resumenGeneral.ultima_actualizacion | date : 'HH:mm:ss'
          }}</span>
        </div>
      </div>

      <!-- Estadísticas por Facultad -->
      <div
        class="estadisticas-section"
        *ngIf="estadisticasFacultades.length > 0"
      >
        <h2>📋 Estadísticas por Facultad</h2>
        <div class="tabla-estadisticas">
          <table>
            <thead>
              <tr>
                <th>Facultad</th>
                <th>Promedio</th>
                <th>Mín.</th>
                <th>Máx.</th>
                <th>Mediciones</th>
                <th>Alertas</th>
                <th>Última Medición</th>
              </tr>
            </thead>
            <tbody>
              <tr
                *ngFor="let stat of estadisticasFacultades"
                (click)="seleccionarFacultad(stat.facultad_id)"
                [class.selected]="facultadSeleccionada === stat.facultad_id"
              >
                <td>{{ stat.facultad_nombre }}</td>
                <td>{{ stat.promedio | number : '1.1-1' }}°C</td>
                <td>{{ stat.temperatura_minima | number : '1.1-1' }}°C</td>
                <td>{{ stat.temperatura_maxima | number : '1.1-1' }}°C</td>
                <td>{{ stat.total_mediciones }}</td>
                <td [class.alertas]="stat.alertas_generadas > 0">
                  {{ stat.alertas_generadas }}
                </td>
                <td>{{ stat.ultima_medicion | date : 'dd/MM/yyyy HH:mm' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Gráfico de Tendencias -->
      <div class="grafico-section" *ngIf="historialData.length > 0">
        <h2>📈 Tendencias de Temperatura</h2>
        <div class="chart-container">
          <canvas #historialChart width="800" height="400"></canvas>
        </div>
      </div>

      <!-- Tabla de Historial Detallado -->
      <div class="historial-detalle" *ngIf="historialData.length > 0">
        <h2>📄 Historial Detallado</h2>
        <div class="tabla-historial">
          <table>
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Facultad</th>
                <th>Temperatura</th>
                <th>Sensor</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr
                *ngFor="let registro of historialData; let i = index"
                [class.alerta]="registro.temperatura > 30"
              >
                <td>{{ registro.fecha | date : 'dd/MM/yyyy HH:mm:ss' }}</td>
                <td>{{ registro.facultad_nombre }}</td>
                <td [class.temp-alta]="registro.temperatura > 30">
                  {{ registro.temperatura }}°C
                </td>
                <td>{{ registro.sensor_id }}</td>
                <td>
                  <span *ngIf="registro.temperatura > 30" class="badge alerta"
                    >🚨 Alerta</span
                  >
                  <span *ngIf="registro.temperatura <= 30" class="badge normal"
                    >✅ Normal</span
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Estado de carga -->
      <div class="loading" *ngIf="cargando">
        <div class="spinner"></div>
        <p>Cargando datos del historial...</p>
      </div>

      <!-- Mensaje cuando no hay datos -->
      <div class="no-data" *ngIf="!cargando && historialData.length === 0">
        <h3>📭 No hay datos disponibles</h3>
        <p>No se encontraron registros para los filtros seleccionados.</p>
      </div>
    </div>
  `,
  styles: [
    `
      .historial-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
        padding: 20px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }
    `,
  ],
})
export class HistorialComponent implements OnInit, OnDestroy {
  historialData: HistorialFacultad[] = [];
  estadisticasFacultades: EstadisticasFacultad[] = [];
  resumenGeneral: ResumenFacultades | null = null;

  facultadSeleccionada = '';
  fechaInicio = '';
  fechaFin = '';
  cargando = false;

  chart: Chart | null = null;

  facultades = [
    { id: 'fti', nombre: 'Facultad de Tecnologías de la Información' },
    { id: 'medicina', nombre: 'Facultad de Medicina' },
    { id: 'turismo', nombre: 'Facultad de Turismo' },
    { id: 'educacion', nombre: 'Facultad de Educación' },
    { id: 'arquitectura', nombre: 'Facultad de Arquitectura' },
    { id: 'idiomas', nombre: 'Instituto de Idiomas' },
  ];

  constructor(private historialService: HistorialService) {
    // Configurar fechas por defecto (última semana)
    const hoy = new Date();
    const semanaAnterior = new Date(hoy);
    semanaAnterior.setDate(hoy.getDate() - 7);

    this.fechaFin = hoy.toISOString().split('T')[0];
    this.fechaInicio = semanaAnterior.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  cargarDatos(): void {
    this.cargarResumen();
    this.cargarEstadisticas();
    this.cargarHistorial();
  }

  cargarResumen(): void {
    this.historialService.obtenerResumenGeneral().subscribe({
      next: (response) => {
        if (response.success) {
          this.resumenGeneral = response.data;
        }
      },
      error: (error) => {
        console.error('Error cargando resumen:', error);
      },
    });
  }

  cargarEstadisticas(): void {
    this.historialService.obtenerEstadisticasTodasFacultades().subscribe({
      next: (response) => {
        if (response.success) {
          this.estadisticasFacultades = response.data;
        }
      },
      error: (error) => {
        console.error('Error cargando estadísticas:', error);
      },
    });
  }

  cargarHistorial(): void {
    this.cargando = true;

    if (this.fechaInicio && this.fechaFin) {
      this.historialService
        .obtenerHistorialPorFechas(
          this.fechaInicio,
          this.fechaFin,
          this.facultadSeleccionada || undefined
        )
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.historialData = response.data;
              this.actualizarGrafico();
            }
            this.cargando = false;
          },
          error: (error) => {
            console.error('Error cargando historial:', error);
            this.cargando = false;
          },
        });
    } else {
      if (this.facultadSeleccionada) {
        this.historialService
          .obtenerHistorialPorFacultad(this.facultadSeleccionada)
          .subscribe({
            next: (response) => {
              if (response.success) {
                this.historialData = response.data;
                this.actualizarGrafico();
              }
              this.cargando = false;
            },
            error: (error) => {
              console.error('Error cargando historial:', error);
              this.cargando = false;
            },
          });
      } else {
        this.historialService.obtenerHistorialGeneral().subscribe({
          next: (response) => {
            if (response.success) {
              this.historialData = response.data;
              this.actualizarGrafico();
            }
            this.cargando = false;
          },
          error: (error) => {
            console.error('Error cargando historial:', error);
            this.cargando = false;
          },
        });
      }
    }
  }

  aplicarFiltros(): void {
    this.cargarHistorial();
  }

  limpiarFiltros(): void {
    this.facultadSeleccionada = '';
    this.fechaInicio = '';
    this.fechaFin = '';
    this.cargarHistorial();
  }

  seleccionarFacultad(facultadId: string): void {
    this.facultadSeleccionada = facultadId;
    this.cargarHistorial();
  }

  exportarDatos(): void {
    this.historialService
      .exportarHistorial(this.facultadSeleccionada || undefined, 'json')
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Crear y descargar archivo
            const blob = new Blob([JSON.stringify(response.data, null, 2)], {
              type: 'application/json',
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `historial-uleam-${Date.now()}.json`;
            link.click();
            window.URL.revokeObjectURL(url);
          }
        },
        error: (error) => {
          console.error('Error exportando datos:', error);
        },
      });
  }

  private actualizarGrafico(): void {
    // Implementación del gráfico se agregará después
    console.log(
      'Actualizando gráfico con',
      this.historialData.length,
      'registros'
    );
  }
}
