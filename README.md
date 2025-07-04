# 🌡️ Sistema IoT de Temperatura - Simulación Completa

Simulación de un sistema IoT completo sin hardware físico, desarrollado con **Angular** (frontend) y **Node.js + MongoDB** (backend).

## 🎯 Objetivo

Simular un sensor de temperatura que envía datos periódicos a un backend, guarda los datos en MongoDB, y permite visualizarlos desde una aplicación web en tiempo real.

## 🛠️ Arquitectura del Sistema

```
┌─────────────────┐    HTTP/Polling    ┌──────────────────┐    MongoDB    ┌─────────────┐
│                 │ ◄─────────────────► │                  │ ◄──────────── │             │
│   Frontend      │      every 5s      │     Backend      │               │   MongoDB   │
│   (Angular)     │                    │  (Node.js +      │               │   Atlas     │
│                 │                    │   Express)       │               │             │
└─────────────────┘                    └──────────────────┘               └─────────────┘
│                                       │
├─ Dashboard                            ├─ API REST
├─ Gráfica Chart.js                     ├─ Sensor Simulado
├─ Alertas de Temp                      ├─ Conexión MongoDB
├─ Control del Sensor                   └─ Validaciones
└─ Estadísticas
```

## 📂 Estructura del Proyecto

```
exposicion_emergentes/
├── Backend/
│   ├── config/
│   │   └── database.js              # Configuración MongoDB
│   ├── models/
│   │   └── LecturaTemperatura.js    # Esquema de datos
│   ├── routes/
│   │   ├── temperatura.js           # CRUD de lecturas
│   │   └── sensor.js               # Control del sensor
│   ├── services/
│   │   └── SensorTemperatura.js    # Lógica del sensor simulado
│   ├── server.js                   # Servidor principal
│   ├── package.json
│   ├── .env                        # Variables de entorno
│   └── README.md
│
└── Frontend/
    └── iot-temperature-frontend/
        ├── src/app/
        │   ├── components/
        │   │   ├── dashboard.component.ts    # Componente principal
        │   │   └── dashboard.component.css   # Estilos
        │   ├── models/
        │   │   └── temperatura.interface.ts  # Interfaces TypeScript
        │   ├── services/
        │   │   └── temperatura.service.ts    # Servicio HTTP
        │   ├── app.ts                       # App principal
        │   └── app.config.ts                # Configuración
        ├── package.json
        └── README.md
```

## 🚀 Instalación y Ejecución

### Prerrequisitos

- Node.js (v18 o superior)
- npm
- Acceso a internet (para MongoDB Atlas)

### 1. Clonar/Descargar el proyecto

```bash
# Si estás clonando desde un repositorio
git clone <repository-url>
cd exposicion_emergentes

# O simplemente navegar al directorio del proyecto
cd exposicion_emergentes
```

### 2. Configurar y ejecutar el Backend

```bash
# Navegar al directorio del backend
cd Backend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo (con auto-reload)
npm run dev

# O ejecutar en modo producción
npm start
```

El backend estará disponible en: **http://localhost:3000**

### 3. Configurar y ejecutar el Frontend

```bash
# Abrir una nueva terminal y navegar al frontend
cd Frontend/iot-temperature-frontend

# Instalar dependencias
npm install

# Ejecutar el servidor de desarrollo
npm start
# o
ng serve
```

El frontend estará disponible en: **http://localhost:4200**

## 📊 Base de Datos

### Configuración MongoDB Atlas

- **URI**: `mongodb+srv://fabriciozavala13:Fabri123.@uleam.kvc0z.mongodb.net/sensor_asistencia`
- **Base de datos**: `sensor_asistencia`
- **Colección**: `lecturas_temperatura`

### Estructura de documentos

```json
{
  "_id": "ObjectId",
  "valor": 28.5,
  "fecha": "2025-07-04T20:00:00Z"
}
```

## 🔧 Funcionalidades

### Backend (Node.js + Express)

- ✅ **Sensor simulado** que genera datos cada 5 segundos
- ✅ **API REST** completa para gestión de lecturas
- ✅ **Validaciones** de temperatura (-50°C a 100°C)
- ✅ **Filtrado** de valores repetidos consecutivos
- ✅ **Alertas** en consola para temperaturas >35°C
- ✅ **Estadísticas** automáticas
- ✅ **CORS** configurado para el frontend

#### Endpoints disponibles:

```
GET  /api/temperatura              # Obtener lecturas (últimas 20)
POST /api/temperatura              # Crear lectura manual
GET  /api/temperatura/estadisticas # Obtener estadísticas
DELETE /api/temperatura            # Limpiar todas las lecturas

POST /api/sensor/iniciar           # Iniciar simulación
POST /api/sensor/detener           # Detener simulación
GET  /api/sensor/estado            # Estado del sensor
```

### Frontend (Angular 18)

- ✅ **Dashboard interactivo** con diseño moderno
- ✅ **Gráfica en tiempo real** usando Chart.js
- ✅ **Polling automático** cada 5 segundos
- ✅ **Alertas visuales** para temperatura alta
- ✅ **Control completo** del sensor (iniciar/detener)
- ✅ **Estadísticas dinámicas**
- ✅ **Tabla de datos** recientes
- ✅ **Diseño responsivo** para móviles
- ✅ **Indicador de conexión** con el backend

## 🎮 Instrucciones de Uso

1. **Iniciar Backend**: Ejecutar `npm run dev` en `/Backend`
2. **Iniciar Frontend**: Ejecutar `npm start` en `/Frontend/iot-temperature-frontend`
3. **Abrir navegador**: Ir a http://localhost:4200
4. **Iniciar simulación**: Hacer clic en "🚀 Iniciar Simulación"
5. **Observar**: La gráfica se actualiza automáticamente cada 5 segundos
6. **Ver alertas**: Aparecen cuando la temperatura supera 35°C

## 📈 Flujo de Datos

```
1. Sensor Simulado (Backend) → Genera temperatura aleatoria (20-40°C)
2. Validación → Verifica rango válido y evita duplicados
3. MongoDB → Guarda la lectura con timestamp
4. Frontend → Polling cada 5s para obtener nuevos datos
5. Chart.js → Actualiza gráfica con animaciones
6. Alertas → Se muestran si temperatura > 35°C
```

## 🔍 Características Técnicas

### Backend

- **Framework**: Express.js
- **Base de datos**: MongoDB Atlas con Mongoose ODM
- **Validaciones**: Joi/Express validator
- **CORS**: Configurado para desarrollo
- **Logging**: Console logs detallados
- **Error handling**: Manejo global de errores

### Frontend

- **Framework**: Angular 18 (Standalone Components)
- **Gráficas**: Chart.js con ng2-charts
- **HTTP Client**: Angular HttpClient
- **Estilos**: CSS3 con Grid y Flexbox
- **Responsivo**: Media queries para móviles
- **TypeScript**: Interfaces tipadas

## 🚨 Resolución de Problemas

### Backend no inicia

- Verificar que el puerto 3000 esté libre
- Revisar la conexión a MongoDB Atlas
- Comprobar variables de entorno en `.env`

### Frontend no conecta

- Asegurar que el backend esté corriendo
- Verificar CORS en el backend
- Comprobar la URL de la API en `temperatura.service.ts`

### Gráfica no se muestra

- Verificar que Chart.js esté instalado
- Revisar errores en la consola del navegador
- Comprobar que lleguen datos del backend

## 📱 Capturas de Pantalla

El dashboard incluye:

- 🟢 Estado del sensor (activo/inactivo)
- 📊 Gráfica de línea con puntos coloreados por temperatura
- 📈 Tarjetas de estadísticas (total, promedio, máximo, mínimo, alertas)
- 🚨 Alertas automáticas para temperaturas altas
- 📋 Tabla con las últimas 10 lecturas
- 🎛️ Controles para iniciar/detener/limpiar

## 🔮 Posibles Mejoras

- [ ] WebSockets para tiempo real sin polling
- [ ] Autenticación y autorización
- [ ] Múltiples sensores
- [ ] Histórico con gráficas por períodos
- [ ] Exportación de datos (CSV, Excel)
- [ ] Notificaciones push
- [ ] Panel de administración
- [ ] Tests unitarios e integración

## 👨‍💻 Desarrollado por

**Fabricio Zavala**  
Proyecto de simulación IoT para fines educativos

---

_Este proyecto demuestra una implementación completa de un sistema IoT usando tecnologías web modernas, sin necesidad de hardware físico._
