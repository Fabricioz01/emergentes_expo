import { Component, OnInit, OnDestroy } from '@angular/core';
import { DashboardComponent } from './features/dashboard/dashboard-uleam.component';
import { HistorialComponent } from './features/historial/historial.component';
import { NavigationComponent } from './shared/components/navigation.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    DashboardComponent,
    HistorialComponent,
    NavigationComponent,
    CommonModule,
  ],
  template: `
    <div class="app-container">
      <app-navigation></app-navigation>

      <main class="main-content">
        <app-dashboard *ngIf="vistaActual === 'dashboard'"></app-dashboard>
        <app-historial *ngIf="vistaActual === 'historial'"></app-historial>
      </main>
    </div>
  `,
  styles: [
    `
      .app-container {
        min-height: 100vh;
        width: 100%;
        background: #f7fafc;
      }

      .main-content {
        min-height: calc(100vh - 140px);
        padding: 0;
      }
    `,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'iot-temperature-frontend';
  vistaActual = 'dashboard';

  ngOnInit(): void {
    // Escuchar eventos de cambio de tab
    window.addEventListener('cambiarTab', this.manejarCambioTab.bind(this));
  }

  ngOnDestroy(): void {
    window.removeEventListener('cambiarTab', this.manejarCambioTab.bind(this));
  }

  manejarCambioTab(event: any): void {
    this.vistaActual = event.detail;
  }
}
