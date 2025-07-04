import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { TemperaturaService } from '../services/temperatura.service';
import {
  LecturaTemperatura,
  EstadisticasTemperatura,
  EstadoSensor,
} from '../models/temperatura.interface';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>🌡️ Monitor de Temperatura IoT</h1>
        <p>Simulación de sensor de temperatura en tiempo real</p>
      </header>

      <!-- Controles del sensor -->
      <section class="sensor-controls">
        <div
          class="status-card"
          [ngClass]="{
            active: estadoSensor?.isRunning,
            inactive: !estadoSensor?.isRunning
          }"
        >
          <div class="status-icon">
            {{ estadoSensor?.isRunning ? '🟢' : '🔴' }}
          </div>
          <div class="status-info">
            <h3>Estado del Sensor</h3>
            <p>{{ estadoSensor?.isRunning ? 'Activo' : 'Inactivo' }}</p>
            <small
              *ngIf="
                estadoSensor?.ultimaLectura !== null &&
                estadoSensor?.ultimaLectura !== undefined
              "
            >
              Última lectura: {{ estadoSensor!.ultimaLectura }}°C
            </small>
          </div>
        </div>

        <div class="control-buttons">
          <button
            class="btn btn-primary"
            (click)="iniciarSensor()"
            [disabled]="estadoSensor?.isRunning || cargando"
          >
            <span *ngIf="!cargando">🚀 Iniciar Simulación</span>
            <span *ngIf="cargando">⏳ Procesando...</span>
          </button>

          <button
            class="btn btn-secondary"
            (click)="detenerSensor()"
            [disabled]="!estadoSensor?.isRunning || cargando"
          >
            🛑 Detener Simulación
          </button>

          <button
            class="btn btn-danger"
            (click)="limpiarDatos()"
            [disabled]="cargando"
          >
            🗑️ Limpiar Datos
          </button>
        </div>
      </section>

      <!-- Alertas de temperatura -->
      <section class="alerts" *ngIf="alertaTemperatura">
        <div class="alert alert-warning">
          🔥 <strong>¡ALERTA!</strong> Temperatura alta detectada:
          {{ temperaturaAlta }}°C
        </div>
      </section>

      <!-- Estadísticas -->
      <section class="stats" *ngIf="estadisticas">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ estadisticas.total }}</div>
            <div class="stat-label">Total Lecturas</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ estadisticas.promedio }}°C</div>
            <div class="stat-label">Promedio</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ estadisticas.maximo }}°C</div>
            <div class="stat-label">Máximo</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ estadisticas.minimo }}°C</div>
            <div class="stat-label">Mínimo</div>
          </div>
          <div
            class="stat-card"
            [ngClass]="{ 'alert-stat': estadisticas.alertas > 0 }"
          >
            <div class="stat-number">{{ estadisticas.alertas }}</div>
            <div class="stat-label">Alertas</div>
          </div>
        </div>
      </section>

      <!-- Gráfica de temperatura -->
      <section class="chart-section">
        <div class="chart-header">
          <h2>📊 Gráfica de Temperatura</h2>
          <div class="chart-info">
            <span>Últimas {{ lecturas.length }} lecturas</span>
            <span class="update-time" *ngIf="ultimaActualizacion">
              Actualizado: {{ ultimaActualizacion | date : 'medium' }}
            </span>
          </div>
        </div>

        <div class="chart-container">
          <canvas #temperaturaChart></canvas>
        </div>

        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-color normal"></span>
            <span>Temperatura Normal (≤35°C)</span>
          </div>
          <div class="legend-item">
            <span class="legend-color alert"></span>
            <span>Temperatura Alta (>35°C)</span>
          </div>
        </div>
      </section>

      <!-- Tabla de datos recientes -->
      <section class="recent-data" *ngIf="lecturas.length > 0">
        <h3>📋 Últimas Lecturas</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Hora</th>
                <th>Temperatura</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr
                *ngFor="let lectura of lecturas.slice(-10).reverse()"
                [ngClass]="{ 'alert-row': lectura.valor > 35 }"
              >
                <td>{{ lectura.fecha | date : 'HH:mm:ss' }}</td>
                <td>{{ lectura.valor }}°C</td>
                <td>
                  <span
                    class="status-badge"
                    [ngClass]="lectura.valor > 35 ? 'high' : 'normal'"
                  >
                    {{ lectura.valor > 35 ? '🔥 Alta' : '✅ Normal' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Estado de conexión -->
      <footer class="connection-status">
        <div
          class="status-indicator"
          [ngClass]="{ connected: !error, disconnected: error }"
        >
          {{ error ? '🔴 Desconectado' : '🟢 Conectado' }}
        </div>
        <small>{{ error || 'Backend: http://localhost:3000' }}</small>
      </footer>
    </div>
  `,
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('temperaturaChart', { static: true })
  chartRef!: ElementRef<HTMLCanvasElement>;

  lecturas: LecturaTemperatura[] = [];
  estadisticas: EstadisticasTemperatura | null = null;
  estadoSensor: EstadoSensor | null = null;

  chart: Chart | null = null;
  pollingInterval: any;
  ultimaActualizacion: Date | null = null;

  cargando = false;
  error: string | null = null;
  alertaTemperatura = false;
  temperaturaAlta = 0;

  constructor(private temperaturaService: TemperaturaService) {}

  ngOnInit(): void {
    this.inicializarChart();
    this.cargarDatosIniciales();
    this.iniciarPolling();
  }

  ngOnDestroy(): void {
    this.detenerPolling();
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private inicializarChart(): void {
    const ctx = this.chartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Temperatura (°C)',
            data: [],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Temperatura en Tiempo Real',
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            min: 15,
            max: 45,
            title: {
              display: true,
              text: 'Temperatura (°C)',
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Tiempo',
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
          },
        },
        animation: {
          duration: 750,
          easing: 'easeInOutQuart',
        },
      },
    });
  }

  private actualizarChart(): void {
    if (!this.chart) return;

    const labels = this.lecturas.map((l) =>
      new Date(l.fecha).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    );

    const data = this.lecturas.map((l) => l.valor);

    // Colores basados en temperatura
    const pointColors = data.map((temp) => (temp > 35 ? '#ef4444' : '#22c55e'));

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = data;

    // Actualizar colores dinámicamente usando casting para acceder a propiedades específicas de line chart
    const dataset = this.chart.data.datasets[0] as any;
    dataset.pointBackgroundColor = pointColors;
    dataset.pointBorderColor = pointColors;

    this.chart.update('none');
  }

  private cargarDatosIniciales(): void {
    this.cargarLecturas();
    this.cargarEstadisticas();
    this.cargarEstadoSensor();
  }

  private cargarLecturas(): void {
    this.temperaturaService.obtenerLecturas(30).subscribe({
      next: (response) => {
        if (response.success) {
          this.lecturas = response.data;
          this.actualizarChart();
          this.verificarAlertas();
          this.ultimaActualizacion = new Date();
          this.error = null;
        }
      },
      error: (error) => {
        console.error('Error cargando lecturas:', error);
        this.error = 'Error de conexión con el backend';
      },
    });
  }

  private cargarEstadisticas(): void {
    this.temperaturaService.obtenerEstadisticas().subscribe({
      next: (response) => {
        if (response.success) {
          this.estadisticas = response.data;
        }
      },
      error: (error) => {
        console.error('Error cargando estadísticas:', error);
      },
    });
  }

  private cargarEstadoSensor(): void {
    this.temperaturaService.obtenerEstadoSensor().subscribe({
      next: (response) => {
        if (response.success) {
          this.estadoSensor = response.data;
        }
      },
      error: (error) => {
        console.error('Error cargando estado del sensor:', error);
      },
    });
  }

  private verificarAlertas(): void {
    if (this.lecturas.length > 0) {
      const ultimaLectura = this.lecturas[this.lecturas.length - 1];
      if (ultimaLectura.valor > 35) {
        this.alertaTemperatura = true;
        this.temperaturaAlta = ultimaLectura.valor;

        // Ocultar alerta después de 10 segundos
        setTimeout(() => {
          this.alertaTemperatura = false;
        }, 10000);
      }
    }
  }

  private iniciarPolling(): void {
    // Actualizar cada 5 segundos
    this.pollingInterval = setInterval(() => {
      this.cargarLecturas();
      this.cargarEstadisticas();
      this.cargarEstadoSensor();
    }, 5000);
  }

  private detenerPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  iniciarSensor(): void {
    this.cargando = true;
    this.temperaturaService.iniciarSensor().subscribe({
      next: (response) => {
        if (response.success) {
          this.estadoSensor = response.data;
          console.log('Sensor iniciado exitosamente');
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error iniciando sensor:', error);
        this.error = 'Error iniciando el sensor';
        this.cargando = false;
      },
    });
  }

  detenerSensor(): void {
    this.cargando = true;
    this.temperaturaService.detenerSensor().subscribe({
      next: (response) => {
        if (response.success) {
          this.estadoSensor = response.data;
          console.log('Sensor detenido exitosamente');
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error deteniendo sensor:', error);
        this.error = 'Error deteniendo el sensor';
        this.cargando = false;
      },
    });
  }

  limpiarDatos(): void {
    if (confirm('¿Estás seguro de que quieres eliminar todas las lecturas?')) {
      this.cargando = true;
      this.temperaturaService.limpiarLecturas().subscribe({
        next: (response) => {
          if (response.success) {
            this.lecturas = [];
            this.estadisticas = null;
            this.actualizarChart();
            console.log('Datos eliminados exitosamente');
          }
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error eliminando datos:', error);
          this.error = 'Error eliminando los datos';
          this.cargando = false;
        },
      });
    }
  }
}
