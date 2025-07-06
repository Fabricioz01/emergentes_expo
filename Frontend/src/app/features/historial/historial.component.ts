import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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
  styleUrls: ['./historial.component.css'],
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
          <span class="stat-value">{{ resumenGeneral?.total_facultades || 0 }}</span>
        </div>
        <div class="stat-card">
          <h3>📈 Promedio General</h3>
          <span class="stat-value"
            >{{ (resumenGeneral?.promedio_general || 0) | number : '1.1-1' }}°C</span
          >
        </div>
        <div class="stat-card">
          <h3>🚨 Total Alertas</h3>
          <span class="stat-value">{{ resumenGeneral?.alertas_totales || 0 }}</span>
        </div>
        <div class="stat-card">
          <h3>⏰ Última Actualización</h3>
          <span class="stat-value">{{
            (resumenGeneral?.ultima_actualizacion || '---') | date : 'HH:mm:ss'
          }}</span>
        </div>
      </div>

      <!-- Estadísticas por Facultad -->
      <div
        class="estadisticas-section"
        *ngIf="estadisticasFacultades && estadisticasFacultades.length > 0"
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
      <div class="grafico-section" *ngIf="historialData && historialData.length > 0">
        <h2>📈 Tendencias de Temperatura</h2>
        <div class="chart-container">
          <canvas #historialChart width="800" height="400"></canvas>
        </div>
      </div>

      <!-- Tabla de Historial Detallado -->
      <div class="historial-detalle" *ngIf="historialData && historialData.length > 0">
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
      <div class="no-data" *ngIf="!cargando && (!historialData || historialData.length === 0)">
        <h3>📭 No hay datos disponibles</h3>
        <p>No se encontraron registros para los filtros seleccionados.</p>
      </div>
    </div>
  `,
})
export class HistorialComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('historialChart', { static: false }) historialChartRef!: ElementRef<HTMLCanvasElement>;

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
    // Configurar fechas por defecto (último mes para mayor rango)
    const hoy = new Date();
    const unMesAnterior = new Date(hoy);
    unMesAnterior.setMonth(hoy.getMonth() - 1);

    this.fechaFin = hoy.toISOString().split('T')[0];
    this.fechaInicio = unMesAnterior.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngAfterViewInit(): void {
    // El gráfico se actualizará cuando se carguen los datos
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

    // También cargar datos de todas las fechas para verificar si hay datos
    this.cargarTodosLosDatos();
  }

  cargarTodosLosDatos(): void {
    // Cargar todos los datos sin filtro de fecha para debug - usando endpoint general
    this.historialService.obtenerHistorialGeneral().subscribe({
      next: (response: any) => {
        console.log('📊 Todos los datos del historial (general):', response);
        if (response.success && response.data.length > 0) {
          console.log(
            `Se encontraron ${response.data.length} registros en total`
          );
        } else {
          console.log('No se encontraron datos en el historial');
        }
      },
      error: (error: any) => {
        console.error('Error cargando todos los datos:', error);
      },
    });
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
    
    console.log('🔍 Cargando historial con parámetros:', {
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      facultadSeleccionada: this.facultadSeleccionada
    });

    if (this.fechaInicio && this.fechaFin) {
      console.log('📅 Usando filtro por fechas');
      this.historialService
        .obtenerHistorialPorFechas(
          this.fechaInicio,
          this.fechaFin,
          this.facultadSeleccionada || undefined
        )
        .subscribe({
          next: (response) => {
            console.log('📊 Respuesta historial por fechas:', response);
            if (response.success) {
              this.historialData = response.data;
              this.actualizarGrafico();
            }
            this.cargando = false;
          },
          error: (error) => {
            console.error('❌ Error cargando historial:', error);
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
    if (!this.historialData || this.historialData.length === 0) {
      console.log('No hay datos para el gráfico');
      return;
    }

    // Verificar que el ViewChild esté disponible
    if (!this.historialChartRef) {
      console.log('Canvas del gráfico aún no está disponible');
      setTimeout(() => this.actualizarGrafico(), 100);
      return;
    }

    console.log('Actualizando gráfico con', this.historialData.length, 'registros');

    // Destruir gráfico anterior si existe
    if (this.chart) {
      this.chart.destroy();
    }

    // Preparar datos para el gráfico
    const datos = this.historialData.slice(0, 20).reverse(); // Últimos 20 registros
    const labels = datos.map(d => new Date(d.fecha).toLocaleString('es', { 
      day: '2-digit', 
      month: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    }));
    const facultades = datos.map(d => d.facultad_nombre);

    // Crear datasets por facultad
    const facultadesUnicas = [...new Set(facultades)];
    const colores = [
      '#667eea', '#764ba2', '#f093fb', '#f5576c', 
      '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'
    ];

    const datasets = facultadesUnicas.map((facultad, index) => {
      const datosFacultad = datos
        .map((d, i) => d.facultad_nombre === facultad ? { x: i, y: d.temperatura } : null)
        .filter(d => d !== null);

      return {
        label: facultad,
        data: datosFacultad,
        borderColor: colores[index % colores.length],
        backgroundColor: colores[index % colores.length] + '20',
        borderWidth: 2,
        fill: false,
        tension: 0.4
      };
    });

    // Crear gráfico usando ViewChild
    const canvas = this.historialChartRef.nativeElement;
    
    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Tendencias de Temperatura por Facultad',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Temperatura (°C)'
            },
            grid: {
              color: '#e2e8f0'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Fecha y Hora'
            },
            grid: {
              color: '#e2e8f0'
            }
          }
        },
        elements: {
          point: {
            radius: 4,
            hoverRadius: 6
          }
        }
      }
    });

    console.log('✅ Gráfico actualizado exitosamente');
  }
}
