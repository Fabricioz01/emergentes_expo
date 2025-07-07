import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { TemperaturaService } from '../../core/temperatura.service';
import {
  LecturaTemperatura,
  EstadisticasTemperatura,
  EstadoSensor,
} from '../../core/temperatura.interface';

Chart.register(...registerables);

interface Facultad {
  id: string;
  nombre: string;
  nombreCorto: string;
  icono: string;
  color: string;
  emoji: string;
  posicion: { x: number; y: number };
  tempRange: { min: number; max: number };
  visitada: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="uleam-monitoring-container">
      <!-- Header universitario -->
      <header class="university-header">
        <div class="logo-section">
          <h1>🎓 ULEAM - Monitoreo de Temperatura</h1>
          <p>Universidad Laica Eloy Alfaro de Manabí</p>
          <p class="subtitle">Sistema Interactivo de Sensores IoT</p>
        </div>

        <div class="control-panel">
          <button
            class="btn-university primary"
            (click)="iniciarSistema()"
            [disabled]="sistemaActivo || cargando"
            [class.pulse]="!sistemaActivo"
          >
            <span *ngIf="!sistemaActivo">🚀 Iniciar Monitoreo</span>
            <span *ngIf="sistemaActivo">🔄 Sistema Activo</span>
          </button>

          <button
            class="btn-university stop"
            (click)="detenerSistema()"
            [disabled]="!sistemaActivo"
          >
            🛑 Detener
          </button>

          <button class="btn-university reset" (click)="resetearDatos()">
            🗑️ Limpiar Datos
          </button>
        </div>
      </header>

      <!-- Campus universitario -->
      <div class="campus-map">
        <div class="map-title">
          <h3>📍 Campus Universidad Laica Eloy Alfaro de Manabí</h3>
          <p *ngIf="!sistemaActivo" class="instruction">
            Haz clic en "Iniciar Monitoreo" y luego selecciona una facultad para
            que el estudiante tome mediciones
          </p>
          <p *ngIf="sistemaActivo && !estudianteOcupado" class="instruction">
            Haz clic en cualquier facultad para que el estudiante se dirija allí
          </p>
          <p *ngIf="estudianteOcupado" class="instruction">
            El estudiante está {{ estadoEstudiante }}...
          </p>
        </div>

        <!-- Estudiante -->
        <div
          class="estudiante"
          [style.left.px]="estudiantePosicion.x"
          [style.top.px]="estudiantePosicion.y"
          [class.walking]="estudianteCaminando"
          [class.measuring]="estudianteMidiendo"
          [class.alert]="alertaActiva"
        >
          <div class="estudiante-body">
            <div class="estudiante-head">👨‍🎓</div>
            <div class="estudiante-status">
              <span *ngIf="estadoEstudiante === 'esperando'">fabri</span>
              <span *ngIf="estadoEstudiante === 'caminando'">🚶‍♂️</span>
              <span *ngIf="estadoEstudiante === 'midiendo'">🌡️</span>
              <span *ngIf="estadoEstudiante === 'alerta'">🚨</span>
            </div>
          </div>

          <!-- Efectos de medición -->
          <div class="measurement-effect" *ngIf="estudianteMidiendo">
            <div class="measurement-line"></div>
            <div class="measurement-particles">
              <span *ngFor="let i of [1, 2, 3, 4, 5]">📊</span>
            </div>
          </div>

          <!-- Alerta de temperatura -->
          <div class="alert-effect" *ngIf="alertaActiva">
            <div class="alert-ring"></div>
            <div class="alert-text">🔥 {{ ultimaTemperatura }}°C</div>
          </div>

          <!-- Rastro de movimiento -->
          <div class="movement-trail" *ngIf="estudianteCaminando">
            <div class="trail-dot" *ngFor="let i of [1, 2, 3]"></div>
          </div>
        </div>

        <!-- Facultades -->
        <div
          *ngFor="let facultad of facultades"
          class="facultad"
          [style.left.px]="facultad.posicion.x"
          [style.top.px]="facultad.posicion.y"
          [class.active]="facultadActual?.id === facultad.id"
          [class.visited]="facultad.visitada"
          [class.clickable]="sistemaActivo && !estudianteOcupado"
          (click)="seleccionarFacultad(facultad)"
        >
          <div class="facultad-icon" [style.background-color]="facultad.color">
            {{ facultad.emoji }}
          </div>

          <div class="facultad-label">{{ facultad.nombreCorto }}</div>

          <div
            class="facultad-status"
            *ngIf="facultadActual?.id === facultad.id"
          >
            <div class="measuring-indicator">
              <div class="pulse-ring"></div>
              Midiendo...
            </div>
          </div>

          <!-- Última temperatura de la facultad -->
          <div class="facultad-temp" *ngIf="facultadesData[facultad.id]">
            {{ facultadesData[facultad.id] }}°C
          </div>
        </div>

        <!-- Partículas de fondo del campus -->
        <div class="campus-particles">
          <div
            *ngFor="let particle of particulas"
            class="particle"
            [style.left.px]="particle.x"
            [style.top.px]="particle.y"
            [style.animation-delay.s]="particle.delay"
          >
            {{ particle.symbol }}
          </div>
        </div>
      </div>

      <!-- Panel de estado del estudiante -->
      <div class="student-status" *ngIf="sistemaActivo">
        <div class="status-info">
          <h3>👨‍🎓 Estado del Estudiante</h3>
          <p>
            🎯 Objetivo:
            {{
              facultadActual?.nombre ||
                facultadObjetivo?.nombre ||
                'Esperando selección...'
            }}
          </p>
          <p>📊 Mediciones tomadas: {{ totalMediciones }}</p>
          <p>
            🏛️ Facultades visitadas: {{ facultadesVisitadas.length }} /
            {{ facultades.length }}
          </p>
        </div>

        <div class="student-speech" *ngIf="mensajeEstudiante">
          <div class="speech-bubble">
            {{ mensajeEstudiante }}
          </div>
        </div>
      </div>

      <!-- Alertas de temperatura -->
      <div class="temperature-alerts" *ngIf="alertasRecientes.length > 0">
        <div *ngFor="let alerta of alertasRecientes" class="alert-notification">
          🚨 <strong>Alerta:</strong> {{ alerta.facultad }} registró
          {{ alerta.temperatura }}°C
          <button (click)="cerrarAlerta(alerta)" class="close-alert">×</button>
        </div>
      </div>

      <!-- Panel de estadísticas en tiempo real -->
      <div class="stats-panel">
        <div class="stat-card temperature" *ngIf="estadisticas">
          <div class="stat-icon">🌡️</div>
          <div class="stat-content">
            <div class="stat-value">
              {{ estadisticas.promedio | number : '1.1-1' }}°C
            </div>
            <div class="stat-label">Promedio</div>
          </div>
        </div>

        <div class="stat-card readings" *ngIf="estadisticas">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-value">{{ estadisticas.total }}</div>
            <div class="stat-label">Lecturas</div>
          </div>
        </div>

        <div
          class="stat-card alerts"
          *ngIf="estadisticas"
          [class.danger]="estadisticas.alertas > 0"
        >
          <div class="stat-icon">🚨</div>
          <div class="stat-content">
            <div class="stat-value">{{ estadisticas.alertas }}</div>
            <div class="stat-label">Alertas</div>
          </div>
        </div>

        <div class="stat-card faculties">
          <div class="stat-icon">🏛️</div>
          <div class="stat-content">
            <div class="stat-value">
              {{ facultadesVisitadas.length }}/{{ facultades.length }}
            </div>
            <div class="stat-label">Exploradas</div>
          </div>
        </div>
      </div>

      <!-- Gráfica de monitoreo -->
      <div class="chart-section">
        <div class="chart-header">
          <h3>📈 Monitoreo en Tiempo Real - ULEAM</h3>
          <div class="chart-info">
            <span
              class="connection-status"
              [class.connected]="!error"
              [class.disconnected]="error"
            >
              <span class="status-dot"></span>
              {{ error ? 'Desconectado del servidor' : 'Conectado al sistema' }}
            </span>
          </div>
        </div>

        <div class="chart-container">
          <canvas #temperaturaChart></canvas>
        </div>

        <!-- Leyenda de facultades -->
        <div class="chart-legend">
          <div class="legend-item" *ngFor="let facultad of facultades">
            <span
              class="legend-color"
              [style.background-color]="facultad.color"
            ></span>
            <span>{{ facultad.nombreCorto }}</span>
            <span class="legend-value" *ngIf="facultadesData[facultad.id]">
              {{ facultadesData[facultad.id] }}°C
            </span>
          </div>
        </div>
      </div>

      <!-- Footer universitario -->
      <footer class="university-footer">
        <div class="university-info">
          <span>Universidad Laica Eloy Alfaro de Manabí</span>
          <span>|</span>
          <span>Sistema IoT de Monitoreo</span>
          <span>|</span>
          <span
            >Última actualización:
            {{ ultimaActualizacion | date : 'HH:mm:ss' }}</span
          >
        </div>
      </footer>
    </div>
  `,
  styleUrls: ['./dashboard-uleam.component.css'],
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

  sistemaActivo = false;
  estudiantePosicion = { x: 50, y: 300 };
  estadoEstudiante: 'esperando' | 'caminando' | 'midiendo' | 'alerta' =
    'esperando';
  estudianteOcupado = false;
  estudianteCaminando = false;
  estudianteMidiendo = false;
  alertaActiva = false;
  ultimaTemperatura = 0;
  totalMediciones = 0;

  facultades: Facultad[] = [
    {
      id: 'fti',
      nombre: 'Facultad de Tecnologías de la Información',
      nombreCorto: 'TI',
      icono: '💻',
      emoji: '💻',
      color: '#3B82F6',
      posicion: { x: 550, y: 200 },
      tempRange: { min: 20, max: 26 },
      visitada: false,
    },
    {
      id: 'medicina',
      nombre: 'Facultad de Medicina',
      nombreCorto: 'Medicina',
      icono: '🏥',
      emoji: '🏥',
      color: '#EF4444',
      posicion: { x: 850, y: 160 },
      tempRange: { min: 22, max: 25 },
      visitada: false,
    },
    {
      id: 'turismo',
      nombre: 'Facultad de Turismo',
      nombreCorto: 'Turismo',
      icono: '✈️',
      emoji: '✈️',
      color: '#10B981',
      posicion: { x: 1550, y: 140 },
      tempRange: { min: 19, max: 28 },
      visitada: false,
    },
    {
      id: 'educacion',
      nombre: 'Facultad de Educación',
      nombreCorto: 'Educación',
      icono: '📚',
      emoji: '📚',
      color: '#F59E0B',
      posicion: { x: 690, y: 320 },
      tempRange: { min: 21, max: 27 },
      visitada: false,
    },
    {
      id: 'arquitectura',
      nombre: 'Facultad de Arquitectura',
      nombreCorto: 'Arquitectura',
      icono: '🏗️',
      emoji: '🏗️',
      color: '#8B5CF6',
      posicion: { x: 1050, y: 350 },
      tempRange: { min: 23, max: 30 },
      visitada: false,
    },
    {
      id: 'idiomas',
      nombre: 'Instituto de Idiomas',
      nombreCorto: 'Idiomas',
      icono: '🗣️',
      emoji: '🗣️',
      color: '#EC4899',
      posicion: { x: 1300, y: 180 },
      tempRange: { min: 20, max: 25 },
      visitada: false,
    },
  ];

  facultadActual: Facultad | null = null;
  facultadObjetivo: Facultad | null = null;
  facultadesVisitadas: string[] = [];
  facultadesData: { [key: string]: number } = {};

  mensajeEstudiante = '';
  alertasRecientes: any[] = [];
  particulas: any[] = [];

  constructor(private temperaturaService: TemperaturaService) {}

  ngOnInit(): void {
    this.inicializarChart();
    this.cargarDatosIniciales();
    this.iniciarPolling();
    this.generarParticulas();
  }

  ngOnDestroy(): void {
    this.detenerPolling();
    this.detenerSistema();
    if (this.chart) {
      this.chart.destroy();
    }
  }

  iniciarSistema(): void {
    if (this.sistemaActivo) return;

    this.sistemaActivo = true;
    this.estadoEstudiante = 'esperando';
    this.mostrarMensajeEstudiante(
      '🎓 Sistema iniciado. Selecciona una facultad para comenzar las mediciones.'
    );

    this.temperaturaService.iniciarSensor().subscribe({
      next: (response) => {
        if (response.success) {
          this.estadoSensor = response.data;
        }
      },
      error: (error) => {
        this.sistemaActivo = false;
        this.error = 'Error al conectar con el servidor';
      },
    });
  }

  detenerSistema(): void {
    this.sistemaActivo = false;
    this.estadoEstudiante = 'esperando';
    this.estudianteOcupado = false;
    this.estudianteCaminando = false;
    this.estudianteMidiendo = false;
    this.alertaActiva = false;
    this.facultadActual = null;
    this.facultadObjetivo = null;

    this.mostrarMensajeEstudiante(
      '😴 Sistema detenido. El estudiante está en reposo.'
    );

    this.temperaturaService.detenerSensor().subscribe();
  }

  seleccionarFacultad(facultad: Facultad): void {
    if (!this.sistemaActivo || this.estudianteOcupado) return;

    this.facultadObjetivo = facultad;
    this.mostrarMensajeEstudiante(`🎯 Dirigiéndome a ${facultad.nombre}`);
    this.moverEstudianteA(facultad);
  }

  moverEstudianteA(facultad: Facultad): void {
    this.estudianteOcupado = true;
    this.estudianteCaminando = true;
    this.estadoEstudiante = 'caminando';

    const duracion = 2000;
    const startTime = Date.now();
    const startPos = { ...this.estudiantePosicion };
    const targetPos = { ...facultad.posicion };

    const animacion = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duracion, 1);

      const easeProgress = this.easeInOutQuad(progress);

      this.estudiantePosicion = {
        x: startPos.x + (targetPos.x - startPos.x) * easeProgress,
        y: startPos.y + (targetPos.y - startPos.y) * easeProgress,
      };

      if (progress < 1 && this.sistemaActivo) {
        requestAnimationFrame(animacion);
      } else {
        this.estudianteCaminando = false;
        this.facultadActual = facultad;
        this.tomarMedicion();
      }
    };

    requestAnimationFrame(animacion);
  }

  tomarMedicion(): void {
    if (!this.facultadActual || !this.sistemaActivo) return;

    this.estudianteMidiendo = true;
    this.estadoEstudiante = 'midiendo';
    this.mostrarMensajeEstudiante(
      `🌡️ Tomando medición en ${this.facultadActual.nombre}...`
    );

    setTimeout(() => {
      this.simularLectura();
    }, 2000);
  }

  simularLectura(): void {
    if (!this.facultadActual) return;

    const facultad = this.facultadActual;
    const tempMin = facultad.tempRange.min;
    const tempMax = facultad.tempRange.max;
    const temperatura =
      Math.round((Math.random() * (tempMax - tempMin) + tempMin) * 10) / 10;

    this.ultimaTemperatura = temperatura;
    this.facultadesData[facultad.id] = temperatura;
    this.totalMediciones++;

    if (!facultad.visitada) {
      facultad.visitada = true;
      this.facultadesVisitadas.push(facultad.id);
    }

    const lectura: Omit<LecturaTemperatura, 'id'> = {
      temperatura: temperatura,
      fecha: new Date(),
      ubicacion: facultad.nombre,
      sensor_id: 'estudiante_uleam_001',
    };

    this.temperaturaService.crearLectura(lectura).subscribe({
      next: (response) => {
        if (response.success) {
          this.lecturas.unshift(response.data);
          this.actualizarChart();
          this.cargarEstadisticas();
        }
      },
      error: (error) => {},
    });

    if (temperatura > 30) {
      this.activarAlerta();
    }

    this.estudianteMidiendo = false;
    this.estadoEstudiante = 'esperando';
    this.estudianteOcupado = false;
    this.facultadActual = null;
    this.facultadObjetivo = null;

    this.mostrarMensajeEstudiante(
      `✅ Medición completada: ${temperatura}°C en ${facultad.nombreCorto}`
    );
  }

  activarAlerta(): void {
    this.alertaActiva = true;
    this.estadoEstudiante = 'alerta';

    const alerta = {
      id: Date.now(),
      facultad: this.facultadActual?.nombreCorto,
      temperatura: this.ultimaTemperatura,
      timestamp: new Date(),
    };

    this.alertasRecientes.unshift(alerta);

    if (this.alertasRecientes.length > 5) {
      this.alertasRecientes = this.alertasRecientes.slice(0, 5);
    }

    setTimeout(() => {
      this.alertaActiva = false;
      this.estadoEstudiante = 'esperando';
    }, 3000);
  }

  cerrarAlerta(alerta: any): void {
    this.alertasRecientes = this.alertasRecientes.filter(
      (a) => a.id !== alerta.id
    );
  }

  mostrarMensajeEstudiante(mensaje: string): void {
    this.mensajeEstudiante = mensaje;
    setTimeout(() => {
      this.mensajeEstudiante = '';
    }, 4000);
  }

  resetearDatos(): void {
    if (confirm('¿Estás seguro de que quieres eliminar todos los datos?')) {
      this.cargando = true;
      this.temperaturaService.limpiarDatos().subscribe({
        next: (response) => {
          if (response.success) {
            this.lecturas = [];
            this.estadisticas = null;
            this.facultadesData = {};
            this.alertasRecientes = [];
            this.facultadesVisitadas = [];
            this.totalMediciones = 0;

            this.facultades.forEach((f) => (f.visitada = false));

            this.actualizarChart();
            this.mostrarMensajeEstudiante('🗑️ Datos eliminados correctamente');
          }
        },
        error: (error) => {
          this.error = 'Error al eliminar los datos';
        },
        complete: () => {
          this.cargando = false;
        },
      });
    }
  }

  private easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  private generarParticulas(): void {
    this.particulas = [];
    for (let i = 0; i < 15; i++) {
      this.particulas.push({
        x: Math.random() * 1650,
        y: Math.random() * 400,
        symbol: ['🌿', '🌸', '🦋', '☀️', '🌤️'][Math.floor(Math.random() * 5)],
        delay: Math.random() * 3,
      });
    }
  }

  private cargarDatosIniciales(): void {
    this.cargarLecturas();
    this.cargarEstadisticas();
    this.cargarEstadoSensor();
  }

  private cargarLecturas(): void {
    this.temperaturaService.obtenerLecturas().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.lecturas = response.data;
          this.ultimaActualizacion = new Date();
          this.actualizarChart();
          this.error = null;

          this.actualizarTemperaturasFacultades();
        }
      },
      error: (error) => {
        this.error = 'Error de conexión';
      },
    });
  }

  private actualizarTemperaturasFacultades(): void {

    this.facultades.forEach((facultad) => {
      const lecturasFactultad = this.lecturas.filter((l) => {
        const ubicacion = l.ubicacion || '';
        return (
          ubicacion.toLowerCase().includes(facultad.nombre.toLowerCase()) ||
          ubicacion.toLowerCase().includes(facultad.nombreCorto.toLowerCase())
        );
      });

      if (lecturasFactultad.length > 0) {
        const lecturaReciente = lecturasFactultad[0];
        const temperatura = lecturaReciente.temperatura || 0;
        this.facultadesData[facultad.id] = temperatura;
      }
    });
  }

  private cargarEstadisticas(): void {
    this.temperaturaService.obtenerEstadisticas().subscribe({
      next: (response) => {
        if (response.success) {
          this.estadisticas = response.data;
        }
      },
      error: (error) => {},
    });
  }

  private cargarEstadoSensor(): void {
    this.temperaturaService.obtenerEstadoSensor().subscribe({
      next: (response) => {
        if (response.success) {
          this.estadoSensor = response.data;
        }
      },
      error: (error) => {},
    });
  }

  private iniciarPolling(): void {
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
            pointRadius: 6,
            pointHoverRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart',
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: '🌡️ Temperaturas en Tiempo Real - ULEAM',
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            min: 15,
            max: 35,
            title: {
              display: true,
              text: 'Temperatura (°C)',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Tiempo',
            },
          },
        },
      },
    });
  }

  private actualizarChart(): void {
    if (!this.chart) return;

    const ultimasLecturas = this.lecturas.slice(0, 20).reverse();
    const labels = ultimasLecturas.map((l) =>
      new Date(l.fecha).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    );
    const data = ultimasLecturas.map((l) => l.temperatura || 0);

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = data;
    this.chart.update('active');

    this.actualizarTemperaturasFacultades();
  }
}
