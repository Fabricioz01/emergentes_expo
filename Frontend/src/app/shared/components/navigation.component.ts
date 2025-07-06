import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="navigation">
      <div class="nav-header">
        <h1>🎓 ULEAM IoT</h1>
        <p>Sistema de Monitoreo de Temperatura</p>
      </div>

      <div class="nav-tabs">
        <button
          class="nav-tab"
          [class.active]="tabActivo === 'dashboard'"
          (click)="cambiarTab('dashboard')"
        >
          🏠 Dashboard
        </button>

        <button
          class="nav-tab"
          [class.active]="tabActivo === 'historial'"
          (click)="cambiarTab('historial')"
        >
          📊 Historial
        </button>
      </div>
    </nav>
  `,
  styles: [
    `
      .navigation {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        color: white;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .nav-header {
        text-align: center;
        margin-bottom: 30px;
      }

      .nav-header h1 {
        margin: 0;
        font-size: 2.5rem;
        font-weight: 700;
      }

      .nav-header p {
        margin: 5px 0 0 0;
        opacity: 0.9;
        font-size: 1.1rem;
      }

      .nav-tabs {
        display: flex;
        justify-content: center;
        gap: 20px;
      }

      .nav-tab {
        background: rgba(255, 255, 255, 0.2);
        border: 2px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 15px 30px;
        border-radius: 25px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
      }

      .nav-tab:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
      }

      .nav-tab.active {
        background: white;
        color: #667eea;
        border-color: white;
      }

      @media (max-width: 768px) {
        .navigation {
          padding: 15px;
        }

        .nav-header h1 {
          font-size: 2rem;
        }

        .nav-tabs {
          flex-direction: column;
          align-items: center;
        }

        .nav-tab {
          width: 100%;
          max-width: 200px;
        }
      }
    `,
  ],
})
export class NavigationComponent {
  tabActivo = 'dashboard';

  cambiarTab(tab: string): void {
    this.tabActivo = tab;
    // Emitir evento para cambiar la vista principal
    window.dispatchEvent(new CustomEvent('cambiarTab', { detail: tab }));
  }
}
