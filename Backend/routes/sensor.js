const express = require('express');
const SensorTemperatura = require('../services/SensorTemperatura');
const router = express.Router();

// Instancia única del sensor
const sensor = new SensorTemperatura();

// POST /api/sensor/iniciar - Iniciar simulación del sensor
router.post('/sensor/iniciar', (req, res) => {
  try {
    sensor.iniciar();

    res.json({
      success: true,
      message: 'Sensor de temperatura iniciado',
      estado: sensor.getEstado(),
    });
  } catch (error) {
    console.error('Error iniciando sensor:', error);
    res.status(500).json({
      success: false,
      message: 'Error iniciando sensor',
      error: error.message,
    });
  }
});

// POST /api/sensor/detener - Detener simulación del sensor
router.post('/sensor/detener', (req, res) => {
  try {
    sensor.detener();

    res.json({
      success: true,
      message: 'Sensor de temperatura detenido',
      estado: sensor.getEstado(),
    });
  } catch (error) {
    console.error('Error deteniendo sensor:', error);
    res.status(500).json({
      success: false,
      message: 'Error deteniendo sensor',
      error: error.message,
    });
  }
});

// GET /api/sensor/estado - Obtener estado del sensor
router.get('/sensor/estado', (req, res) => {
  try {
    const estado = sensor.getEstado();

    res.json({
      success: true,
      data: estado,
    });
  } catch (error) {
    console.error('Error obteniendo estado del sensor:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estado del sensor',
      error: error.message,
    });
  }
});

module.exports = router;
