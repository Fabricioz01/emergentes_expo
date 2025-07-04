require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// Importar rutas
const temperaturaRoutes = require('./routes/temperatura');
const sensorRoutes = require('./routes/sensor');

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a MongoDB
connectDB();

// Middlewares
app.use(
  cors({
    origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api', temperaturaRoutes);
app.use('/api', sensorRoutes);

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    message: '🌡️ API de Simulación IoT - Sensor de Temperatura',
    version: '1.0.0',
    endpoints: {
      'GET /api/temperatura': 'Obtener lecturas de temperatura',
      'POST /api/temperatura': 'Crear nueva lectura (manual)',
      'GET /api/temperatura/estadisticas': 'Obtener estadísticas',
      'DELETE /api/temperatura': 'Limpiar todas las lecturas',
      'POST /api/sensor/iniciar': 'Iniciar simulación del sensor',
      'POST /api/sensor/detener': 'Detener simulación del sensor',
      'GET /api/sensor/estado': 'Obtener estado del sensor',
    },
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
  });
});

// Manejo de errores globales
app.use((error, req, res, next) => {
  console.error('Error global:', error);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('🛑 Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Cerrando servidor...');
  process.exit(0);
});
