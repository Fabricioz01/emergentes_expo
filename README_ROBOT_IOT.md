# 🤖 Robot IoT Explorer - Sistema Interactivo de Monitoreo de Temperatura

## 🎯 Descripción del Proyecto

**Robot IoT Explorer** es una experiencia visual e interactiva que simula un sistema IoT de monitoreo de temperatura. Un robot avatar se mueve entre diferentes ambientes (casa, fábrica, granja, laboratorio), toma lecturas de temperatura en tiempo real, y presenta los datos de manera visual y entretenida.

### ✨ Características Principales

- **🤖 Robot Animado**: Avatar que se mueve, escanea y reacciona a temperaturas extremas
- **🌍 Múltiples Ambientes**: Casa, Fábrica, Granja y Laboratorio con diferentes rangos de temperatura
- **📊 Visualización en Tiempo Real**: Gráficas dinámicas con Chart.js
- **🚨 Sistema de Alertas**: Alertas visuales y sonoras para temperaturas anómalas
- **🎮 Controles Interactivos**: Modo demo, control de velocidad, efectos de sonido
- **💾 Base de Datos**: Almacenamiento persistente en MongoDB Atlas
- **📱 Responsive**: Adaptado para diferentes tamaños de pantalla

## 🚀 Inicio Rápido para Demo

### Opción 1: Script Automático (Recomendado)

```bash
# En Windows:
.\iniciar_demo.bat

# En PowerShell:
.\iniciar_demo.ps1
```

### Opción 2: Manual

```bash
# Terminal 1 - Backend
cd Backend
npm install
npm start

# Terminal 2 - Frontend
cd Frontend
npm install
npm start
```

### 🌐 Acceder a la Aplicación

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000

## 🎮 Cómo Usar la Demo

1. **Abrir la aplicación** en http://localhost:4200
2. **Iniciar Misión**: Haz clic en "🚀 Iniciar Misión"
3. **Observar el Robot**: El robot se moverá automáticamente entre ambientes
4. **Ver las Lecturas**: Las temperaturas se muestran en tiempo real
5. **Configurar Opciones**:
   - 🎭 **Modo Demo**: Presentación automática continua
   - 🔊 **Efectos de Sonido**: Activar/desactivar sonidos visuales
   - ⚡ **Velocidad**: Controlar qué tan rápido se mueve el robot

## 🏗️ Arquitectura del Sistema

```
📦 exposicion_emergentes/
├── 🔧 Backend/                 # Node.js + Express + MongoDB
│   ├── models/                 # Esquemas de datos
│   ├── routes/                 # Endpoints de API
│   ├── services/               # Lógica de negocio
│   ├── config/                 # Configuración de BD
│   └── server.js               # Servidor principal
│
├── 🎨 Frontend/                # Angular + Chart.js
│   ├── src/app/components/     # Componente principal del juego
│   ├── src/app/services/       # Servicios de comunicación
│   ├── src/app/models/         # Interfaces TypeScript
│   └── src/index.html          # Página principal
│
├── 📜 iniciar_demo.bat         # Script de inicio automático
├── 📜 iniciar_demo.ps1         # Script PowerShell
└── 📖 README.md                # Esta documentación
```

## 🔧 Tecnologías Utilizadas

### Backend

- **Node.js**: Runtime de JavaScript
- **Express.js**: Framework web
- **MongoDB Atlas**: Base de datos en la nube
- **Mongoose**: ODM para MongoDB

### Frontend

- **Angular 18**: Framework de frontend
- **TypeScript**: Lenguaje tipado
- **Chart.js**: Librería de gráficas
- **CSS3**: Animaciones y estilos modernos

## 🎯 Funcionalidades Técnicas

### Sistema de Simulación

- **Sensor Virtual**: Genera datos realistas según el ambiente
- **Validación de Datos**: Rangos específicos por ubicación
- **Alertas Inteligentes**: Detección automática de anomalías

### Experiencia Visual

- **Animaciones CSS**: Movimiento fluido del robot
- **Efectos Visuales**: Partículas, ondas de escaneo, alertas
- **Interfaz Intuitiva**: Controles fáciles de usar

### Base de Datos

- **Almacenamiento Persistente**: Todas las lecturas se guardan
- **Estadísticas en Tiempo Real**: Promedio, mínimos, máximos
- **API RESTful**: Endpoints organizados y documentados

## 📊 Endpoints de la API

```
GET    /api/temperatura           # Obtener todas las lecturas
POST   /api/temperatura           # Crear nueva lectura
GET    /api/temperatura/estadisticas  # Obtener estadísticas
DELETE /api/temperatura           # Limpiar datos

POST   /api/sensor/iniciar        # Iniciar simulación del sensor
POST   /api/sensor/detener        # Detener simulación
GET    /api/sensor/estado         # Estado actual del sensor
```

## 🔧 Configuración del Entorno

### Variables de Entorno (.env)

```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/iot_temperatura
PORT=3000
NODE_ENV=development
```

### Dependencias Principales

```json
{
  "backend": ["express", "mongoose", "cors", "dotenv"],
  "frontend": ["@angular/core", "chart.js", "ng2-charts"]
}
```

## 🎨 Personalización

### Agregar Nuevos Ambientes

1. Editar `ambientes` array en `dashboard.component.ts`
2. Definir posición, colores y rangos de temperatura
3. Los estilos se aplicarán automáticamente

### Modificar Animaciones

- Editar `dashboard.component.css`
- Ajustar `@keyframes` para diferentes efectos
- Cambiar duraciones en las propiedades CSS

## 🚀 Para Presentaciones

### Consejos para Demo Efectiva

1. **Usar Modo Demo**: Activa el modo automático para presentaciones
2. **Ajustar Velocidad**: Velocidad rápida para demos cortas
3. **Mostrar Alertas**: Dejar que se generen alertas naturalmente
4. **Explicar la Tecnología**: Mencionar IoT, sensores virtuales, tiempo real

### Puntos Clave a Destacar

- ✅ **Simulación Realista**: Datos coherentes por ambiente
- ✅ **Tiempo Real**: Actualizaciones cada 5 segundos
- ✅ **Experiencia Visual**: Más allá de simples gráficas
- ✅ **Tecnología Moderna**: Stack completo JavaScript/TypeScript

## 🛠️ Desarrollo y Contribución

### Instalar Dependencias

```bash
# Backend
cd Backend && npm install

# Frontend
cd Frontend && npm install
```

### Comandos de Desarrollo

```bash
# Backend con auto-reload
npm run dev

# Frontend con live reload
ng serve --open
```

## 📝 Notas Técnicas

- **Puerto Backend**: 3000 (configurable)
- **Puerto Frontend**: 4200 (por defecto Angular)
- **Base de Datos**: MongoDB Atlas (conexión remota)
- **Compatibilidad**: Chrome, Firefox, Edge (ES6+)

## 🆘 Solución de Problemas

### Errores Comunes

1. **Puerto ocupado**: Cambiar puerto en `package.json`
2. **MongoDB desconectado**: Verificar string de conexión
3. **Módulos faltantes**: Ejecutar `npm install`
4. **CORS issues**: Verificar configuración en `server.js`

---

**🎯 Ideal para**: Demos rápidas, presentaciones técnicas, pruebas de concepto IoT

**⏱️ Tiempo de setup**: < 5 minutos

**🎪 Nivel de entretenimiento**: Alto - Perfect para impresionar! 🤩
