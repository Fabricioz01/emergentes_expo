const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Esquema para el historial de facultades
const HistorialFacultadSchema = new mongoose.Schema({
  facultad_id: { type: String, required: true },
  facultad_nombre: { type: String, required: true },
  temperatura: { type: Number, required: true },
  fecha: { type: Date, default: Date.now },
  sensor_id: { type: String, required: true },
  ubicacion: { type: String, required: true },
});

const HistorialFacultad = mongoose.model(
  'HistorialFacultad',
  HistorialFacultadSchema
);

// Función para obtener el ID de facultad basado en la ubicación
function obtenerFacultadId(ubicacion) {
  const ubicacionLower = ubicacion.toLowerCase();

  if (
    ubicacionLower.includes('tecnología') ||
    ubicacionLower.includes('informática') ||
    ubicacionLower.includes('fti')
  ) {
    return { id: 'fti', nombre: 'Facultad de Tecnologías de la Información' };
  } else if (
    ubicacionLower.includes('medicina') ||
    ubicacionLower.includes('salud')
  ) {
    return { id: 'medicina', nombre: 'Facultad de Medicina' };
  } else if (ubicacionLower.includes('turismo')) {
    return { id: 'turismo', nombre: 'Facultad de Turismo' };
  } else if (
    ubicacionLower.includes('educación') ||
    ubicacionLower.includes('educacion')
  ) {
    return { id: 'educacion', nombre: 'Facultad de Educación' };
  } else if (ubicacionLower.includes('arquitectura')) {
    return { id: 'arquitectura', nombre: 'Facultad de Arquitectura' };
  } else if (ubicacionLower.includes('idiomas')) {
    return { id: 'idiomas', nombre: 'Instituto de Idiomas' };
  }

  return { id: 'general', nombre: 'General' };
}

// Middleware para crear registro en historial cuando se crea una lectura
async function crearRegistroHistorial(lecturaData) {
  try {
    const facultad = obtenerFacultadId(lecturaData.ubicacion);

    const historialData = new HistorialFacultad({
      facultad_id: facultad.id,
      facultad_nombre: facultad.nombre,
      temperatura: lecturaData.temperatura,
      fecha: lecturaData.fecha,
      sensor_id: lecturaData.sensor_id,
      ubicacion: lecturaData.ubicacion,
    });

    await historialData.save();
    return historialData;
  } catch (error) {
    console.error('Error creando registro de historial:', error);
    throw error;
  }
}

// GET /api/historial/facultad/:id - Obtener historial por facultad
router.get('/facultad/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;

    const historial = await HistorialFacultad.find({ facultad_id: id })
      .sort({ fecha: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: historial,
      message: `Historial de ${id} obtenido correctamente`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo historial de facultad',
      error: error.message,
    });
  }
});

// GET /api/historial/general - Obtener historial general
router.get('/general', async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const historial = await HistorialFacultad.find()
      .sort({ fecha: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: historial,
      message: 'Historial general obtenido correctamente',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo historial general',
      error: error.message,
    });
  }
});

// GET /api/historial/estadisticas/:id - Obtener estadísticas por facultad
router.get('/estadisticas/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const estadisticas = await HistorialFacultad.aggregate([
      { $match: { facultad_id: id } },
      {
        $group: {
          _id: '$facultad_id',
          facultad_nombre: { $first: '$facultad_nombre' },
          promedio: { $avg: '$temperatura' },
          temperatura_minima: { $min: '$temperatura' },
          temperatura_maxima: { $max: '$temperatura' },
          total_mediciones: { $sum: 1 },
          ultima_medicion: { $max: '$fecha' },
          alertas_generadas: {
            $sum: { $cond: [{ $gt: ['$temperatura', 30] }, 1, 0] },
          },
        },
      },
    ]);

    const resultado =
      estadisticas.length > 0
        ? {
            ...estadisticas[0],
            facultad_id: id,
          }
        : null;

    res.json({
      success: true,
      data: resultado,
      message: `Estadísticas de ${id} obtenidas correctamente`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas de facultad',
      error: error.message,
    });
  }
});

// GET /api/historial/estadisticas/todas - Obtener estadísticas de todas las facultades
router.get('/estadisticas/todas', async (req, res) => {
  try {
    const estadisticas = await HistorialFacultad.aggregate([
      {
        $group: {
          _id: '$facultad_id',
          facultad_nombre: { $first: '$facultad_nombre' },
          promedio: { $avg: '$temperatura' },
          temperatura_minima: { $min: '$temperatura' },
          temperatura_maxima: { $max: '$temperatura' },
          total_mediciones: { $sum: 1 },
          ultima_medicion: { $max: '$fecha' },
          alertas_generadas: {
            $sum: { $cond: [{ $gt: ['$temperatura', 30] }, 1, 0] },
          },
        },
      },
      { $sort: { total_mediciones: -1 } },
    ]);

    const estadisticasConId = estadisticas.map((stat) => ({
      ...stat,
      facultad_id: stat._id,
    }));

    res.json({
      success: true,
      data: estadisticasConId,
      message: 'Estadísticas de todas las facultades obtenidas correctamente',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas de todas las facultades',
      error: error.message,
    });
  }
});

// GET /api/historial/resumen - Obtener resumen general
router.get('/resumen', async (req, res) => {
  try {
    const resumen = await HistorialFacultad.aggregate([
      {
        $group: {
          _id: null,
          total_facultades: { $addToSet: '$facultad_id' },
          promedio_general: { $avg: '$temperatura' },
          alertas_totales: {
            $sum: { $cond: [{ $gt: ['$temperatura', 30] }, 1, 0] },
          },
          ultima_actualizacion: { $max: '$fecha' },
          total_mediciones: { $sum: 1 },
        },
      },
    ]);

    const resultado =
      resumen.length > 0
        ? {
            total_facultades: resumen[0].total_facultades.length,
            facultades_activas: resumen[0].total_facultades.length,
            promedio_general: resumen[0].promedio_general,
            alertas_totales: resumen[0].alertas_totales,
            ultima_actualizacion: resumen[0].ultima_actualizacion,
            total_mediciones: resumen[0].total_mediciones,
          }
        : {
            total_facultades: 0,
            facultades_activas: 0,
            promedio_general: 0,
            alertas_totales: 0,
            ultima_actualizacion: new Date(),
            total_mediciones: 0,
          };

    res.json({
      success: true,
      data: resultado,
      message: 'Resumen general obtenido correctamente',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo resumen general',
      error: error.message,
    });
  }
});

// GET /api/historial/rango - Obtener historial por rango de fechas
router.get('/rango', async (req, res) => {
  try {
    const { inicio, fin, facultad } = req.query;

    if (!inicio || !fin) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren fechas de inicio y fin',
      });
    }

    const filtro = {
      fecha: {
        $gte: new Date(inicio),
        $lte: new Date(fin),
      },
    };

    if (facultad) {
      filtro.facultad_id = facultad;
    }

    const historial = await HistorialFacultad.find(filtro).sort({ fecha: -1 });

    res.json({
      success: true,
      data: historial,
      message: 'Historial por rango de fechas obtenido correctamente',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo historial por rango de fechas',
      error: error.message,
    });
  }
});

// GET /api/historial/exportar - Exportar datos de historial
router.get('/exportar', async (req, res) => {
  try {
    const { facultad, formato = 'json' } = req.query;

    const filtro = facultad ? { facultad_id: facultad } : {};

    const historial = await HistorialFacultad.find(filtro).sort({ fecha: -1 });

    if (formato === 'csv') {
      // Convertir a CSV
      const csvHeader = 'Fecha,Facultad,Temperatura,Sensor,Ubicacion\n';
      const csvData = historial
        .map(
          (h) =>
            `${h.fecha.toISOString()},${h.facultad_nombre},${h.temperatura},${
              h.sensor_id
            },${h.ubicacion}`
        )
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=historial-uleam.csv'
      );
      res.send(csvHeader + csvData);
    } else {
      res.json({
        success: true,
        data: historial,
        message: 'Datos exportados correctamente',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error exportando datos',
      error: error.message,
    });
  }
});

module.exports = {
  router,
  crearRegistroHistorial,
  HistorialFacultad,
};
