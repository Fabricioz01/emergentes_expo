import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import jsPDF from 'jspdf';
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
          <span class="stat-value">{{
            resumenGeneral?.total_facultades || 0
          }}</span>
        </div>
        <div class="stat-card">
          <h3>📈 Promedio General</h3>
          <span class="stat-value"
            >{{
              resumenGeneral?.promedio_general || 0 | number : '1.1-1'
            }}°C</span
          >
        </div>
        <div class="stat-card">
          <h3>🚨 Total Alertas</h3>
          <span class="stat-value">{{
            resumenGeneral?.alertas_totales || 0
          }}</span>
        </div>
        <div class="stat-card">
          <h3>⏰ Última Actualización</h3>
          <span class="stat-value">{{
            resumenGeneral?.ultima_actualizacion || '---' | date : 'HH:mm:ss'
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
      <div
        class="grafico-section"
        *ngIf="historialData && historialData.length > 0"
      >
        <h2>📈 Tendencias de Temperatura</h2>
        <div class="chart-container">
          <canvas #historialChart width="800" height="400"></canvas>
        </div>
      </div>

      <!-- Tabla de Historial Detallado -->
      <div
        class="historial-detalle"
        *ngIf="historialData && historialData.length > 0"
      >
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
      <div
        class="no-data"
        *ngIf="!cargando && (!historialData || historialData.length === 0)"
      >
        <h3>📭 No hay datos disponibles</h3>
        <p>No se encontraron registros para los filtros seleccionados.</p>
      </div>
    </div>
  `,
})
export class HistorialComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('historialChart', { static: false })
  historialChartRef!: ElementRef<HTMLCanvasElement>;

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
      facultadSeleccionada: this.facultadSeleccionada,
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
    // Generar PDF directamente con los datos actuales
    this.generarPDF();
  }

  private generarPDF(): void {
    const doc = new jsPDF();

    // Configurar fuente
    doc.setFont('helvetica');

    const fechaActual = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const facultadTexto = this.facultadSeleccionada
      ? this.facultades.find((f) => f.id === this.facultadSeleccionada)
          ?.nombre || 'Facultad Seleccionada'
      : 'Todas las Facultades';

    let yPosition = 20;

    // HEADER
    doc.setFontSize(18);
    doc.setTextColor(59, 130, 246); // Azul
    doc.text('REPORTE DE TEMPERATURAS IOT', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(14);
    doc.setTextColor(16, 185, 129); // Verde
    doc.text('Universidad Laica Eloy Alfaro de Manabi (ULEAM)', 20, yPosition);
    yPosition += 6;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Sistema de Monitoreo Ambiental por Facultades', 20, yPosition);
    yPosition += 15;

    // LÍNEA SEPARADORA
    doc.setDrawColor(59, 130, 246);
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 10;

    // INFORMACIÓN DEL REPORTE
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Fecha de Generacion: ' + fechaActual, 20, yPosition);
    yPosition += 6;
    doc.text('Alcance del Reporte: ' + facultadTexto, 20, yPosition);
    yPosition += 15;

    // RESUMEN EJECUTIVO
    if (this.resumenGeneral) {
      doc.setFontSize(14);
      doc.setTextColor(59, 130, 246);
      doc.text('RESUMEN EJECUTIVO', 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(
        'Total Facultades: ' + (this.resumenGeneral.total_facultades || 0),
        20,
        yPosition
      );
      yPosition += 5;
      doc.text(
        'Promedio General: ' +
          (this.resumenGeneral.promedio_general || 0).toFixed(1) +
          'C',
        20,
        yPosition
      );
      yPosition += 5;
      doc.text(
        'Total Alertas: ' + (this.resumenGeneral.alertas_totales || 0),
        20,
        yPosition
      );
      yPosition += 5;
      doc.text(
        'Total Mediciones: ' + (this.historialData?.length || 0),
        20,
        yPosition
      );
      yPosition += 15;
    }

    // ESTADÍSTICAS POR FACULTAD
    if (this.estadisticasFacultades && this.estadisticasFacultades.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(59, 130, 246);
      doc.text('ESTADISTICAS POR FACULTAD', 20, yPosition);
      yPosition += 10;

      // Headers de la tabla
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(59, 130, 246);
      doc.rect(20, yPosition - 3, 170, 6, 'F');
      doc.text('Facultad', 22, yPosition);
      doc.text('Promedio', 90, yPosition);
      doc.text('Min.', 110, yPosition);
      doc.text('Max.', 125, yPosition);
      doc.text('Mediciones', 140, yPosition);
      doc.text('Alertas', 170, yPosition);
      yPosition += 6;

      // Datos de la tabla
      doc.setTextColor(0, 0, 0);
      this.estadisticasFacultades.forEach((stat, index) => {
        if (yPosition > 270) {
          // Nueva página si es necesario
          doc.addPage();
          yPosition = 20;
        }

        // Alternar color de fondo
        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(20, yPosition - 3, 170, 5, 'F');
        }

        const facultadNombre =
          stat.facultad_nombre.length > 25
            ? stat.facultad_nombre.substring(0, 25) + '...'
            : stat.facultad_nombre;

        doc.text(facultadNombre, 22, yPosition);
        doc.text(stat.promedio.toFixed(1) + 'C', 90, yPosition);
        doc.text(stat.temperatura_minima.toFixed(1) + 'C', 110, yPosition);
        doc.text(stat.temperatura_maxima.toFixed(1) + 'C', 125, yPosition);
        doc.text(stat.total_mediciones.toString(), 140, yPosition);

        // Alertas en rojo si hay
        if (stat.alertas_generadas > 0) {
          doc.setTextColor(239, 68, 68);
          doc.text(stat.alertas_generadas.toString(), 170, yPosition);
          doc.setTextColor(0, 0, 0);
        } else {
          doc.text('0', 170, yPosition);
        }

        yPosition += 5;
      });

      yPosition += 10;
    }

    // HISTORIAL DETALLADO
    if (this.historialData && this.historialData.length > 0) {
      if (yPosition > 250) {
        // Nueva página si es necesario
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(59, 130, 246);
      doc.text('HISTORIAL DETALLADO DE MEDICIONES', 20, yPosition);
      yPosition += 10;

      // Headers de la tabla
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(59, 130, 246);
      doc.rect(20, yPosition - 3, 170, 6, 'F');
      doc.text('Fecha y Hora', 22, yPosition);
      doc.text('Facultad', 60, yPosition);
      doc.text('Temp.', 110, yPosition);
      doc.text('Sensor', 130, yPosition);
      doc.text('Estado', 160, yPosition);
      yPosition += 6;

      // Datos de la tabla (máximo 20 registros)
      doc.setTextColor(0, 0, 0);
      const datosParaPDF = this.historialData.slice(0, 20);

      datosParaPDF.forEach((registro, index) => {
        if (yPosition > 270) {
          // Nueva página si es necesario
          doc.addPage();
          yPosition = 20;

          // Repetir headers en nueva página
          doc.setFontSize(8);
          doc.setTextColor(255, 255, 255);
          doc.setFillColor(59, 130, 246);
          doc.rect(20, yPosition - 3, 170, 6, 'F');
          doc.text('Fecha y Hora', 22, yPosition);
          doc.text('Facultad', 60, yPosition);
          doc.text('Temp.', 110, yPosition);
          doc.text('Sensor', 130, yPosition);
          doc.text('Estado', 160, yPosition);
          yPosition += 6;
        }

        // Alternar color de fondo
        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(20, yPosition - 3, 170, 5, 'F');
        }

        const fechaFormateada = new Date(registro.fecha).toLocaleString(
          'es-ES',
          {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }
        );

        const facultadNombre =
          registro.facultad_nombre.length > 20
            ? registro.facultad_nombre.substring(0, 20) + '...'
            : registro.facultad_nombre;

        const esAlerta = registro.temperatura > 30;

        doc.setTextColor(0, 0, 0);
        doc.text(fechaFormateada, 22, yPosition);
        doc.text(facultadNombre, 60, yPosition);

        // Temperatura en rojo si es alerta
        if (esAlerta) {
          doc.setTextColor(239, 68, 68);
          doc.text(registro.temperatura + 'C', 110, yPosition);
          doc.setTextColor(0, 0, 0);
        } else {
          doc.text(registro.temperatura + 'C', 110, yPosition);
        }

        doc.text(registro.sensor_id, 130, yPosition);

        // Estado
        if (esAlerta) {
          doc.setTextColor(239, 68, 68);
          doc.text('ALERTA', 160, yPosition);
          doc.setTextColor(0, 0, 0);
        } else {
          doc.setTextColor(16, 185, 129);
          doc.text('NORMAL', 160, yPosition);
          doc.setTextColor(0, 0, 0);
        }

        yPosition += 5;
      });

      if (this.historialData.length > 20) {
        yPosition += 5;
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          'Mostrando los 20 registros mas recientes de ' +
            this.historialData.length +
            ' total',
          20,
          yPosition
        );
      }
    }

    // FOOTER EN TODAS LAS PÁGINAS
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Línea separadora del footer
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 280, 190, 280);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Sistema de Monitoreo IoT - ULEAM', 20, 285);
      doc.text('Generado automaticamente el ' + fechaActual, 20, 290);
      doc.text(
        'Datos de sensores de temperatura distribuidos por facultades',
        20,
        295
      );

      // Número de página
      doc.text('Pagina ' + i + ' de ' + pageCount, 170, 295);
    }

    // Generar nombre del archivo
    const nombreArchivo = `Reporte_Temperaturas_ULEAM_${new Date().getFullYear()}_${(
      new Date().getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}_${new Date()
      .getDate()
      .toString()
      .padStart(2, '0')}.pdf`;

    // Descargar el PDF
    doc.save(nombreArchivo);

    console.log('✅ PDF descargado exitosamente:', nombreArchivo);
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

    console.log(
      'Actualizando gráfico con',
      this.historialData.length,
      'registros'
    );

    // Destruir gráfico anterior si existe
    if (this.chart) {
      this.chart.destroy();
    }

    // Preparar datos para el gráfico
    const datos = this.historialData.slice(0, 20).reverse(); // Últimos 20 registros
    const labels = datos.map((d) =>
      new Date(d.fecha).toLocaleString('es', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    );
    const facultades = datos.map((d) => d.facultad_nombre);

    // Crear datasets por facultad
    const facultadesUnicas = [...new Set(facultades)];
    const colores = [
      '#667eea',
      '#764ba2',
      '#f093fb',
      '#f5576c',
      '#4facfe',
      '#00f2fe',
      '#43e97b',
      '#38f9d7',
    ];

    const datasets = facultadesUnicas.map((facultad, index) => {
      const datosFacultad = datos
        .map((d, i) =>
          d.facultad_nombre === facultad ? { x: i, y: d.temperatura } : null
        )
        .filter((d) => d !== null);

      return {
        label: facultad,
        data: datosFacultad,
        borderColor: colores[index % colores.length],
        backgroundColor: colores[index % colores.length] + '20',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      };
    });

    // Crear gráfico usando ViewChild
    const canvas = this.historialChartRef.nativeElement;

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Tendencias de Temperatura por Facultad',
            font: { size: 16, weight: 'bold' },
          },
          legend: {
            display: true,
            position: 'top',
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Temperatura (°C)',
            },
            grid: {
              color: '#e2e8f0',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Fecha y Hora',
            },
            grid: {
              color: '#e2e8f0',
            },
          },
        },
        elements: {
          point: {
            radius: 4,
            hoverRadius: 6,
          },
        },
      },
    });

    console.log('✅ Gráfico actualizado exitosamente');
  }
}
