# IoT Temperature Sensor Backend

Backend para la simulación de un sensor IoT de temperatura usando Node.js, Express y MongoDB.

## Instalación

```bash
npm install
```

## Configuración

1. Asegúrate de que el archivo `.env` tenga la configuración correcta:

```
MONGODB_URI=mongodb+srv://fabriciozavala13:Fabri123.@uleam.kvc0z.mongodb.net/sensor_asistencia
PORT=3000
NODE_ENV=development
```

## Ejecución

### Desarrollo (con auto-reload)

```bash
npm run dev
```

### Producción

```bash
npm start
```

## Endpoints de la API

### Lecturas de Temperatura

- `GET /api/temperatura` - Obtener últimas lecturas (por defecto 20)
- `POST /api/temperatura` - Crear nueva lectura manual
- `GET /api/temperatura/estadisticas` - Obtener estadísticas
- `DELETE /api/temperatura` - Limpiar todas las lecturas

### Control del Sensor

- `POST /api/sensor/iniciar` - Iniciar simulación automática
- `POST /api/sensor/detener` - Detener simulación
- `GET /api/sensor/estado` - Obtener estado actual del sensor

## Funcionamiento

1. El servidor genera automáticamente lecturas de temperatura cada 5 segundos
2. Las temperaturas están entre 20°C y 40°C
3. Se ignoran valores repetidos consecutivos
4. Se genera alerta cuando la temperatura supera 35°C
5. Los datos se guardan en MongoDB en la colección `lecturas_temperatura`

## Estructura del Proyecto

```
Backend/
├── config/
│   └── database.js          # Configuración de MongoDB
├── models/
│   └── LecturaTemperatura.js # Modelo de datos
├── routes/
│   ├── temperatura.js       # Rutas para lecturas
│   └── sensor.js           # Rutas para control del sensor
├── services/
│   └── SensorTemperatura.js # Lógica del sensor simulado
├── server.js               # Archivo principal
├── package.json
└── .env                    # Variables de entorno
```
