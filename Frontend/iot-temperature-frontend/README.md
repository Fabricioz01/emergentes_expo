# IoT Temperature Frontend

Frontend de la simulación de sensor IoT de temperatura desarrollado con Angular 18.

## Características

- 📊 **Gráfica en tiempo real** usando Chart.js
- 🚨 **Alertas automáticas** cuando la temperatura supera 35°C
- 📈 **Estadísticas** en tiempo real (promedio, máximo, mínimo, alertas)
- 🎛️ **Control del sensor** (iniciar/detener simulación)
- 📱 **Diseño responsivo** adaptable a móviles
- ⚡ **Polling automático** cada 5 segundos
- 🧹 **Limpieza de datos** con confirmación

## Instalación y Ejecución

1. Navegar al directorio del frontend:

```bash
cd Frontend/iot-temperature-frontend
```

2. Instalar dependencias:

```bash
npm install
```

3. Ejecutar en modo desarrollo:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
