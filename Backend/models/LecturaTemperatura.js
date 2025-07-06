const mongoose = require('mongoose');

// Esquema para las lecturas de temperatura
const lecturaTemperaturaSchema = new mongoose.Schema({
  valor: {
    type: Number,
    required: true,
    min: -50,
    max: 100,
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
  ubicacion: {
    type: String,
    default: 'Ubicación desconocida',
  },
  sensor_id: {
    type: String,
    default: 'sensor_default',
  },
});

// Índice para optimizar consultas por fecha
lecturaTemperaturaSchema.index({ fecha: -1 });

module.exports = mongoose.model(
  'LecturaTemperatura',
  lecturaTemperaturaSchema,
  'lecturas_temperatura'
);
