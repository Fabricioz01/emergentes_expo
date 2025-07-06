const express = require('express');
const LecturaTemperatura = require('../models/LecturaTemperatura');
const { crearRegistroHistorial } = require('./historial');
const router = express.Router();

// GET /api/temperatura - Obtener últimas lecturas
router.get('/temperatura', async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 20;

    const lecturas = await LecturaTemperatura.find()
      .sort({ fecha: -1 })
      .limit(limite)
      .lean();

    // Invertir para mostrar en orden cronológico
    const lecturasOrdenadas = lecturas.reverse();

    res.json({
      success: true,
      data: lecturasOrdenadas,
      total: lecturasOrdenadas.length,
    });
  } catch (error) {
    console.error('Error obteniendo lecturas:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo lecturas de temperatura',
      error: error.message,
    });
  }
});

// POST /api/temperatura - Crear nueva lectura (para pruebas manuales)
router.post('/temperatura', async (req, res) => {
  try {
    const { temperatura, ubicacion, sensor_id } = req.body;

    if (!temperatura || typeof temperatura !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'El valor de temperatura es requerido y debe ser un número',
      });
    }

    if (temperatura < -50 || temperatura > 100) {
      return res.status(400).json({
        success: false,
        message: 'La temperatura debe estar entre -50°C y 100°C',
      });
    }

    const nuevaLectura = new LecturaTemperatura({
      valor: temperatura,
      fecha: new Date(),
      ubicacion: ubicacion || 'Ubicación desconocida',
      sensor_id: sensor_id || 'sensor_default',
    });

    const lecturaGuardada = await nuevaLectura.save();

    // Crear registro en historial
    try {
      await crearRegistroHistorial({
        temperatura: temperatura,
        fecha: lecturaGuardada.fecha,
        ubicacion: ubicacion || 'Ubicación desconocida',
        sensor_id: sensor_id || 'sensor_default',
      });
    } catch (historialError) {
      console.warn('Error creando registro de historial:', historialError);
      // No fallar la respuesta principal por error en historial
    }

    res.status(201).json({
      success: true,
      message: 'Lectura de temperatura guardada exitosamente',
      data: {
        id: lecturaGuardada._id,
        temperatura: lecturaGuardada.valor,
        fecha: lecturaGuardada.fecha,
        ubicacion: lecturaGuardada.ubicacion,
        sensor_id: lecturaGuardada.sensor_id,
      },
    });
  } catch (error) {
    console.error('Error guardando lectura:', error);
    res.status(500).json({
      success: false,
      message: 'Error guardando lectura de temperatura',
      error: error.message,
    });
  }
});

// GET /api/temperatura/estadisticas - Obtener estadísticas básicas
router.get('/temperatura/estadisticas', async (req, res) => {
  try {
    const lecturas = await LecturaTemperatura.find().lean();

    if (lecturas.length === 0) {
      return res.json({
        success: true,
        data: {
          total: 0,
          promedio: 0,
          maximo: 0,
          minimo: 0,
          alertas: 0,
        },
      });
    }

    const valores = lecturas.map((l) => l.valor);
    const maximo = Math.max(...valores);
    const minimo = Math.min(...valores);
    const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
    const alertas = valores.filter((v) => v > 35).length;

    res.json({
      success: true,
      data: {
        total: lecturas.length,
        promedio: Math.round(promedio * 10) / 10,
        maximo,
        minimo,
        alertas,
      },
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas',
      error: error.message,
    });
  }
});

// DELETE /api/temperatura - Limpiar todas las lecturas (para pruebas)
router.delete('/temperatura', async (req, res) => {
  try {
    const resultado = await LecturaTemperatura.deleteMany({});

    res.json({
      success: true,
      message: `${resultado.deletedCount} lecturas eliminadas`,
      deletedCount: resultado.deletedCount,
    });
  } catch (error) {
    console.error('Error eliminando lecturas:', error);
    res.status(500).json({
      success: false,
      message: 'Error eliminando lecturas',
      error: error.message,
    });
  }
});

module.exports = router;
