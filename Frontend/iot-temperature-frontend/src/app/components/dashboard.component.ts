import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { TemperaturaService } from '../services/temperatura.service';
import {
  LecturaTemperatura,
  EstadisticasTemperatura,
  EstadoSensor,
} from '../models/temperatura.interface';

Chart.register(...registerables);

interface Ambiente {
  id: string;
  nombre: string;
  icono: string;
  color: string;
  emoji: string;
  posicion: { x: number; y: number };
  tempRange: { min: number; max: number };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="iot-game-container">
      <!-- Header con controles principales -->
      <header class="game-header">
        <div class="logo-section">
          <h1>🤖 Robot IoT Explorer</h1>
          <p>Simulación interactiva de sensores de temperatura</p>
        </div>

        <div class="control-panel">
          <button
            class="btn-game start"
            (click)="iniciarMision()"
            [disabled]="misionActiva || cargando"
            [class.pulse]="!misionActiva"
          >
            <span *ngIf="!misionActiva">🚀 Iniciar Misión</span>
            <span *ngIf="misionActiva">🔄 Misión Activa</span>
          </button>

          <button
            class="btn-game demo"
            (click)="toggleModoDemo()"
            [class.active]="modoDemo"
          >
            🎭 {{ modoDemo ? 'Demo ON' : 'Demo OFF' }}
          </button>

          <button
            class="btn-game stop"
            (click)="detenerMision()"
            [disabled]="!misionActiva"
          >
            🛑 Detener
          </button>

          <button
            class="btn-game sound"
            (click)="toggleEfectosSonido()"
            [class.active]="efectosSonido"
          >
            {{ efectosSonido ? '🔊' : '🔇' }} Sonido
          </button>

          <button class="btn-game reset" (click)="resetearDatos()">
            🗑️ Reset
          </button>
        </div>
      </header>

      <!-- Área principal del juego -->
      <div class="game-world">
        <!-- Robot -->
        <div
          class="robot"
          [style.left.px]="robotPosicion.x"
          [style.top.px]="robotPosicion.y"
          [class.walking]="robotCaminando"
          [class.scanning]="robotEscaneando"
          [class.alert]="alertaActiva"
        >
          <div class="robot-body">
            <div class="robot-head">🤖</div>
            <div class="robot-status">
              <span *ngIf="robotEstado === 'idle'">💤</span>
              <span *ngIf="robotEstado === 'walking'">🚶‍♂️</span>
              <span *ngIf="robotEstado === 'scanning'">🔍</span>
              <span *ngIf="robotEstado === 'alert'">🚨</span>
            </div>
          </div>

          <!-- Efectos visuales -->
          <div class="scan-effect" *ngIf="robotEscaneando">
            <div class="scan-line"></div>
            <div class="scan-particles">
              <span *ngFor="let i of [1, 2, 3, 4, 5]">✨</span>
            </div>
            <!-- Simulación de sonido visual -->
            <div class="sound-wave" *ngIf="efectosSonido">
              <div class="wave" *ngFor="let w of [1, 2, 3]"></div>
            </div>
          </div>

          <!-- Alerta de temperatura -->
          <div class="alert-effect" *ngIf="alertaActiva">
            <div class="alert-ring"></div>
            <div class="alert-text">🔥 {{ ultimaTemperatura }}°C</div>
            <div class="danger-particles">
              <span *ngFor="let i of [1, 2, 3, 4, 5, 6]" class="danger-particle"
                >⚠️</span
              >
            </div>
          </div>

          <!-- Efectos de movimiento -->
          <div class="movement-trail" *ngIf="robotCaminando">
            <div class="trail-dot" *ngFor="let i of [1, 2, 3]"></div>
          </div>
        </div>

        <!-- Ambientes -->
        <div
          *ngFor="let ambiente of ambientes"
          class="ambiente"
          [style.left.px]="ambiente.posicion.x"
          [style.top.px]="ambiente.posicion.y"
          [class.active]="ambienteActual?.id === ambiente.id"
          [class.visited]="ambientesVisitados.includes(ambiente.id)"
        >
          <div class="ambiente-icon" [style.background-color]="ambiente.color">
            {{ ambiente.emoji }}
          </div>

          <div class="ambiente-label">{{ ambiente.nombre }}</div>

          <div
            class="ambiente-status"
            *ngIf="ambienteActual?.id === ambiente.id"
          >
            <div class="scanning-indicator">
              <div class="pulse-ring"></div>
              Escaneando...
            </div>
          </div>

          <!-- Últimas lecturas del ambiente -->
          <div class="ambiente-temp" *ngIf="ambientesData[ambiente.id]">
            {{ ambientesData[ambiente.id] }}°C
          </div>
        </div>

        <!-- Partículas de fondo -->
        <div class="background-particles">
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

        <!-- Camino del robot -->
        <svg class="robot-path" width="100%" height="100%">
          <path
            *ngIf="caminoActual.length > 0"
            [attr.d]="generarCamino()"
            class="path-line"
            [class.active]="misionActiva"
          ></path>
        </svg>
      </div>

      <!-- Panel de estado de la misión -->
      <div class="mission-status" *ngIf="misionActiva">
        <div class="mission-info">
          <h3>📡 Estado de la Misión</h3>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="progresoMision"></div>
            <span class="progress-text">{{ progresoMision }}% completado</span>
          </div>
          <p>
            🎯 Objetivo: {{ ambienteObjetivo?.nombre || 'Calculando ruta...' }}
          </p>
          <p>🔄 Ciclo: {{ cicloActual }} / ∞</p>
          <p *ngIf="modoDemo" class="demo-indicator">🎭 MODO DEMO ACTIVO</p>
        </div>

        <div class="robot-speech" *ngIf="mensajeRobot">
          <div class="speech-bubble">
            {{ mensajeRobot }}
          </div>
        </div>

        <!-- Controles de velocidad -->
        <div class="speed-controls">
          <label>⚡ Velocidad del Robot:</label>
          <input
            type="range"
            min="500"
            max="5000"
            step="500"
            [(ngModel)]="velocidadRobot"
            class="speed-slider"
          />
          <span>{{ getVelocidadTexto() }}</span>
        </div>
      </div>

      <!-- Alertas de temperatura -->
      <div class="temperature-alerts" *ngIf="alertasRecientes.length > 0">
        <div
          *ngFor="let alerta of alertasRecientes"
          class="alert-notification"
          [@slideIn]
        >
          🚨 <strong>Alerta:</strong> {{ alerta.ambiente }} registró
          {{ alerta.temperatura }}°C
          <button (click)="cerrarAlerta(alerta)" class="close-alert">×</button>
        </div>
      </div>

      <!-- Panel de estadísticas en tiempo real -->
      <div class="stats-panel">
        <div class="stat-card temperature" *ngIf="estadisticas">
          <div class="stat-icon">🌡️</div>
          <div class="stat-content">
            <div class="stat-value">{{ estadisticas.promedio }}°C</div>
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

        <div class="stat-card environments">
          <div class="stat-icon">🏠</div>
          <div class="stat-content">
            <div class="stat-value">
              {{ ambientesVisitados.length }}/{{ ambientes.length }}
            </div>
            <div class="stat-label">Explorados</div>
          </div>
        </div>
      </div>

      <!-- Gráfica interactiva -->
      <div class="chart-section">
        <div class="chart-header">
          <h3>📈 Monitoreo en Tiempo Real</h3>
          <div class="chart-controls">
            <button
              class="chart-btn"
              (click)="cambiarVistaGrafica('linea')"
              [class.active]="vistaGrafica === 'linea'"
            >
              📊 Línea
            </button>
            <button
              class="chart-btn"
              (click)="cambiarVistaGrafica('barras')"
              [class.active]="vistaGrafica === 'barras'"
            >
              📈 Barras
            </button>
          </div>
        </div>

        <div class="chart-container">
          <canvas #temperaturaChart></canvas>
        </div>

        <!-- Leyenda interactiva -->
        <div class="chart-legend">
          <div class="legend-item" *ngFor="let ambiente of ambientes">
            <span
              class="legend-color"
              [style.background-color]="ambiente.color"
            ></span>
            <span>{{ ambiente.nombre }}</span>
            <span class="legend-value" *ngIf="ambientesData[ambiente.id]">
              {{ ambientesData[ambiente.id] }}°C
            </span>
          </div>
        </div>
      </div>

      <!-- Footer con información de conexión -->
      <footer class="game-footer">
        <div
          class="connection-status"
          [class.connected]="!error"
          [class.disconnected]="error"
        >
          <span class="status-dot"></span>
          {{
            error ? 'Desconectado del servidor' : 'Conectado a MongoDB Atlas'
          }}
        </div>
        <div class="game-info">
          <span
            >Última actualización:
            {{ ultimaActualizacion | date : 'HH:mm:ss' }}</span
          >
          <span>|</span>
          <span>Backend: localhost:3000</span>
        </div>
      </footer>
    </div>
  `,
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('temperaturaChart', { static: true })
  chartRef!: ElementRef<HTMLCanvasElement>;

  // Datos existentes
  lecturas: LecturaTemperatura[] = [];
  estadisticas: EstadisticasTemperatura | null = null;
  estadoSensor: EstadoSensor | null = null;
  chart: Chart | null = null;
  pollingInterval: any;
  ultimaActualizacion: Date | null = null;
  cargando = false;
  error: string | null = null;

  // Nuevas propiedades para el juego
  misionActiva = false;
  robotPosicion = { x: 50, y: 300 };
  robotEstado: 'idle' | 'walking' | 'scanning' | 'alert' = 'idle';
  robotCaminando = false;
  robotEscaneando = false;
  alertaActiva = false;
  ultimaTemperatura = 0;
  modoDemo = false;
  efectosSonido = true;
  velocidadRobot = 2000; // milisegundos para moverse entre ambientes

  ambientes: Ambiente[] = [
    {
      id: 'casa',
      nombre: 'Casa',
      icono: '🏠',
      emoji: '🏠',
      color: '#34D399',
      posicion: { x: 100, y: 100 },
      tempRange: { min: 18, max: 25 },
    },
    {
      id: 'fabrica',
      nombre: 'Fábrica',
      icono: '🏭',
      emoji: '🏭',
      color: '#F59E0B',
      posicion: { x: 400, y: 150 },
      tempRange: { min: 25, max: 40 },
    },
    {
      id: 'granja',
      nombre: 'Granja',
      icono: '🚜',
      emoji: '🚜',
      color: '#10B981',
      posicion: { x: 700, y: 200 },
      tempRange: { min: 15, max: 30 },
    },
    {
      id: 'laboratorio',
      nombre: 'Laboratorio',
      icono: '🧪',
      emoji: '🧪',
      color: '#8B5CF6',
      posicion: { x: 550, y: 350 },
      tempRange: { min: 20, max: 35 },
    },
  ];

  ambienteActual: Ambiente | null = null;
  ambienteObjetivo: Ambiente | null = null;
  ambientesVisitados: string[] = [];
  ambientesData: { [key: string]: number } = {};

  progresoMision = 0;
  cicloActual = 0;
  misionInterval: any;

  mensajeRobot = '';
  alertasRecientes: any[] = [];
  particulas: any[] = [];
  caminoActual: { x: number; y: number }[] = [];

  vistaGrafica: 'linea' | 'barras' = 'linea';

  constructor(private temperaturaService: TemperaturaService) {}

  ngOnInit(): void {
    this.inicializarChart();
    this.cargarDatosIniciales();
    this.iniciarPolling();
    this.generarParticulas();
  }

  ngOnDestroy(): void {
    this.detenerPolling();
    this.detenerMision();
    if (this.chart) {
      this.chart.destroy();
    }
  }

  // Métodos del juego
  iniciarMision(): void {
    if (this.misionActiva) return;

    this.misionActiva = true;
    this.cicloActual = 0;
    this.ambientesVisitados = [];
    this.robotEstado = 'walking';
    this.mostrarMensajeRobot('🚀 ¡Iniciando misión de exploración!');

    // Iniciar el sensor del backend
    this.temperaturaService.iniciarSensor().subscribe({
      next: (response) => {
        if (response.success) {
          this.estadoSensor = response.data;
          this.comenzarCicloExploracion();
        }
      },
      error: (error) => {
        console.error('Error iniciando sensor:', error);
        this.misionActiva = false;
      },
    });
  }

  detenerMision(): void {
    this.misionActiva = false;
    this.robotEstado = 'idle';
    this.robotCaminando = false;
    this.robotEscaneando = false;
    this.alertaActiva = false;
    this.ambienteActual = null;
    this.ambienteObjetivo = null;

    if (this.misionInterval) {
      clearInterval(this.misionInterval);
    }

    this.mostrarMensajeRobot('😴 Misión detenida. Robot en reposo.');

    // Detener el sensor del backend
    this.temperaturaService.detenerSensor().subscribe();
  }

  comenzarCicloExploracion(): void {
    if (!this.misionActiva) return;

    this.cicloActual++;
    this.progresoMision = 0;

    // Seleccionar ambiente aleatorio
    const ambientesDisponibles = this.ambientes.filter(
      (a) =>
        !this.ambientesVisitados.includes(a.id) ||
        this.ambientesVisitados.length === this.ambientes.length
    );

    if (this.ambientesVisitados.length === this.ambientes.length) {
      this.ambientesVisitados = []; // Reiniciar ciclo
    }

    this.ambienteObjetivo =
      ambientesDisponibles[
        Math.floor(Math.random() * ambientesDisponibles.length)
      ];
    this.mostrarMensajeRobot(
      `🎯 Dirigiéndome a ${this.ambienteObjetivo.nombre}`
    );

    this.moverRobotA(this.ambienteObjetivo);
  }

  moverRobotA(ambiente: Ambiente): void {
    this.robotCaminando = true;
    this.robotEstado = 'walking';
    this.caminoActual = this.calcularCamino(
      this.robotPosicion,
      ambiente.posicion
    );
    this.simularEfectoSonido('move');

    const duracion = this.velocidadRobot; // Usar velocidad configurable
    const startTime = Date.now();
    const startPos = { ...this.robotPosicion };
    const targetPos = { ...ambiente.posicion };

    const animacion = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duracion, 1);

      // Interpolación suave
      const easeProgress = this.easeInOutQuad(progress);

      this.robotPosicion = {
        x: startPos.x + (targetPos.x - startPos.x) * easeProgress,
        y: startPos.y + (targetPos.y - startPos.y) * easeProgress,
      };

      this.progresoMision = progress * 50; // 50% para el movimiento

      if (progress < 1 && this.misionActiva) {
        requestAnimationFrame(animacion);
      } else {
        this.robotCaminando = false;
        this.ambienteActual = ambiente;
        this.escanearAmbiente();
      }
    };

    requestAnimationFrame(animacion);
  }

  escanearAmbiente(): void {
    if (!this.ambienteActual || !this.misionActiva) return;

    this.robotEscaneando = true;
    this.robotEstado = 'scanning';
    this.mostrarMensajeRobot(`🔍 Escaneando ${this.ambienteActual.nombre}...`);
    this.simularEfectoSonido('scan');

    setTimeout(() => {
      this.simularLectura();
    }, 1500);
  }

  simularLectura(): void {
    if (!this.ambienteActual) return;

    // Generar temperatura según el ambiente
    const range = this.ambienteActual.tempRange;
    const temperatura = Math.random() * (range.max - range.min) + range.min;
    const temperaturaRedondeada = Math.round(temperatura * 10) / 10;

    this.ultimaTemperatura = temperaturaRedondeada;
    this.ambientesData[this.ambienteActual.id] = temperaturaRedondeada;

    // Verificar alerta
    if (temperaturaRedondeada > 35) {
      this.activarAlerta();
    }

    this.robotEscaneando = false;
    this.progresoMision = 100;

    if (!this.ambientesVisitados.includes(this.ambienteActual.id)) {
      this.ambientesVisitados.push(this.ambienteActual.id);
    }

    this.mostrarMensajeRobot(
      `✅ Lectura completada: ${temperaturaRedondeada}°C`
    );

    // Continuar con el siguiente ambiente después de 2 segundos
    setTimeout(() => {
      if (this.misionActiva) {
        this.ambienteActual = null;
        this.robotEstado = 'idle';
        this.comenzarCicloExploracion();
      }
    }, 2000);
  }

  activarAlerta(): void {
    this.alertaActiva = true;
    this.robotEstado = 'alert';
    this.simularEfectoSonido('alert');

    const alerta = {
      id: Date.now(),
      ambiente: this.ambienteActual?.nombre,
      temperatura: this.ultimaTemperatura,
      timestamp: new Date(),
    };

    this.alertasRecientes.unshift(alerta);

    if (this.alertasRecientes.length > 3) {
      this.alertasRecientes = this.alertasRecientes.slice(0, 3);
    }

    this.mostrarMensajeRobot(
      `🚨 ¡Alerta! Temperatura alta: ${this.ultimaTemperatura}°C`
    );

    // Reproducir sonido de alerta (opcional)
    this.reproducirSonidoAlerta();

    setTimeout(() => {
      this.alertaActiva = false;
    }, 3000);
  }

  cerrarAlerta(alerta: any): void {
    this.alertasRecientes = this.alertasRecientes.filter(
      (a) => a.id !== alerta.id
    );
  }

  mostrarMensajeRobot(mensaje: string): void {
    this.mensajeRobot = mensaje;
    setTimeout(() => {
      this.mensajeRobot = '';
    }, 3000);
  }

  calcularCamino(
    inicio: { x: number; y: number },
    fin: { x: number; y: number }
  ): { x: number; y: number }[] {
    return [inicio, fin];
  }

  generarCamino(): string {
    if (this.caminoActual.length < 2) return '';

    let path = `M ${this.caminoActual[0].x} ${this.caminoActual[0].y}`;
    for (let i = 1; i < this.caminoActual.length; i++) {
      path += ` L ${this.caminoActual[i].x} ${this.caminoActual[i].y}`;
    }
    return path;
  }

  easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  generarParticulas(): void {
    this.particulas = [];
    const simbolos = ['💨', '⭐', '✨', '💫', '🌟'];

    for (let i = 0; i < 15; i++) {
      this.particulas.push({
        x: Math.random() * 800,
        y: Math.random() * 400,
        symbol: simbolos[Math.floor(Math.random() * simbolos.length)],
        delay: Math.random() * 5,
      });
    }
  }

  cambiarVistaGrafica(vista: 'linea' | 'barras'): void {
    this.vistaGrafica = vista;
    this.actualizarChart();
  }

  resetearDatos(): void {
    if (confirm('¿Estás seguro de que quieres eliminar todos los datos?')) {
      this.temperaturaService.limpiarDatos().subscribe({
        next: (response) => {
          if (response.success) {
            this.lecturas = [];
            this.estadisticas = null;
            this.ambientesData = {};
            this.ambientesVisitados = [];
            this.alertasRecientes = [];
            this.actualizarChart();
            this.mostrarMensajeRobot('🗑️ Datos limpiados exitosamente');
          }
        },
        error: (error) => {
          console.error('Error limpiando datos:', error);
        },
      });
    }
  }

  reproducirSonidoAlerta(): void {
    // Implementación opcional de sonido
    try {
      const audio = new Audio();
      audio.src =
        'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Dvq2MeCAiN1fLNeSsFJHfI8N2PQAoVX7Tp66hWFAlFnuDvq2QeCAiN1fLNeSsFJXfH8N2PQQoUXrTp66hVFAlGnuDwrmQdBwiN1fPNeSsFJXfH8N2QQAoVX7Tp66hWFAlFnuDvq2QeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUXrTp66hVFAlGn+Dvq2MeCAiN1fLNeSsFJHfH8N2QQAoUX...';
      audio.play().catch(() => {
        // Silenciosamente fallar si no se puede reproducir
      });
    } catch (error) {
      // Ignorar errores de audio
    }
  }

  // Métodos originales adaptados
  private inicializarChart(): void {
    const ctx = this.chartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: this.vistaGrafica === 'linea' ? 'line' : 'bar',
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
            text: '🌡️ Temperaturas en Tiempo Real',
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            min: 10,
            max: 50,
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

    const labels = this.lecturas.map((l) =>
      new Date(l.fecha).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    );

    const data = this.lecturas.map((l) => l.temperatura);
    const pointColors = data.map((temp) => (temp > 35 ? '#ef4444' : '#22c55e'));

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = data;

    const dataset = this.chart.data.datasets[0] as any;
    dataset.pointBackgroundColor = pointColors;
    dataset.pointBorderColor = pointColors;

    this.chart.update('active');
  }

  private cargarDatosIniciales(): void {
    this.cargarLecturas();
    this.cargarEstadisticas();
    this.cargarEstadoSensor();
  }

  private cargarLecturas(): void {
    this.temperaturaService.obtenerLecturas().subscribe({
      next: (response) => {
        if (response.success) {
          this.lecturas = response.data;
          this.actualizarChart();
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

  // Nuevos métodos para funcionalidades adicionales
  toggleModoDemo(): void {
    this.modoDemo = !this.modoDemo;
    if (this.modoDemo && !this.misionActiva) {
      this.iniciarMision();
    }
    this.mostrarMensajeRobot(
      this.modoDemo
        ? '🎭 Modo demo activado - Presentación automática'
        : '👤 Modo manual activado'
    );
  }

  toggleEfectosSonido(): void {
    this.efectosSonido = !this.efectosSonido;
    this.mostrarMensajeRobot(
      this.efectosSonido
        ? '🔊 Efectos de sonido activados'
        : '🔇 Efectos de sonido desactivados'
    );
  }

  getVelocidadTexto(): string {
    if (this.velocidadRobot <= 1000) return 'Muy Rápido';
    if (this.velocidadRobot <= 2000) return 'Rápido';
    if (this.velocidadRobot <= 3000) return 'Normal';
    if (this.velocidadRobot <= 4000) return 'Lento';
    return 'Muy Lento';
  }

  private simularEfectoSonido(tipo: 'scan' | 'alert' | 'move'): void {
    if (!this.efectosSonido) return;

    // Simular efectos de sonido con animaciones visuales adicionales
    const efectoDiv = document.createElement('div');
    efectoDiv.className = `sound-effect ${tipo}`;

    switch (tipo) {
      case 'scan':
        efectoDiv.innerHTML = '♪ BEEP ♪';
        break;
      case 'alert':
        efectoDiv.innerHTML = '♪ ALARM ♪';
        break;
      case 'move':
        efectoDiv.innerHTML = '♪ WHIRR ♪';
        break;
    }

    document.body.appendChild(efectoDiv);
    setTimeout(() => {
      document.body.removeChild(efectoDiv);
    }, 1000);
  }
}
