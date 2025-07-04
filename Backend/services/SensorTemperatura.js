const LecturaTemperatura = require('../models/LecturaTemperatura');

// Clase para simular el sensor de temperatura
class SensorTemperatura {
  constructor() {
    this.intervalo = null;
    this.ultimaLectura = null;
    this.isRunning = false;
  }

  // Generar temperatura aleatoria entre 20 y 40°C
  generarTemperatura() {
    // Generar con decimales para mayor realismo
    const temperatura = Math.random() * (40 - 20) + 20;
    return Math.round(temperatura * 10) / 10; // Redondear a 1 decimal
  }

  // Validar que la temperatura esté en rango válido
  validarTemperatura(valor) {
    return valor >= -50 && valor <= 100;
  }

  // Procesar y guardar lectura
  async procesarLectura() {
    try {
      const temperatura = this.generarTemperatura();

      // Validar temperatura
      if (!this.validarTemperatura(temperatura)) {
        console.log(`⚠️ Temperatura fuera de rango: ${temperatura}°C`);
        return;
      }

      // Evitar valores repetidos consecutivos
      if (this.ultimaLectura === temperatura) {
        console.log(`🔄 Temperatura repetida ignorada: ${temperatura}°C`);
        return;
      }

      // Crear nueva lectura
      const nuevaLectura = new LecturaTemperatura({
        valor: temperatura,
        fecha: new Date(),
      });

      await nuevaLectura.save();
      this.ultimaLectura = temperatura;

      console.log(`🌡️ Nueva lectura guardada: ${temperatura}°C`);

      // Alerta si temperatura alta
      if (temperatura > 35) {
        console.log(`🔥 ¡ALERTA! Temperatura alta: ${temperatura}°C`);
      }
    } catch (error) {
      console.error('❌ Error procesando lectura:', error.message);
    }
  }

  // Iniciar simulación
  iniciar() {
    if (this.isRunning) {
      console.log('⚠️ El sensor ya está en funcionamiento');
      return;
    }

    console.log('🚀 Iniciando sensor de temperatura...');
    this.isRunning = true;

    // Procesar primera lectura inmediatamente
    this.procesarLectura();

    // Configurar intervalo de 5 segundos
    this.intervalo = setInterval(() => {
      this.procesarLectura();
    }, 5000);
  }

  // Detener simulación
  detener() {
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = null;
      this.isRunning = false;
      console.log('🛑 Sensor de temperatura detenido');
    }
  }

  // Obtener estado del sensor
  getEstado() {
    return {
      isRunning: this.isRunning,
      ultimaLectura: this.ultimaLectura,
    };
  }
}

module.exports = SensorTemperatura;
