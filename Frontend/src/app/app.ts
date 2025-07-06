import { Component } from '@angular/core';
import { DashboardComponent } from './components/dashboard-uleam.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DashboardComponent],
  template: `
    <div class="app-container">
      <app-dashboard></app-dashboard>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      width: 100%;
    }
  `]
})
export class AppComponent {
  title = 'iot-temperature-frontend';
}
