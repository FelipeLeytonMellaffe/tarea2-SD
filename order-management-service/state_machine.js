const sendOrderStatusUpdate = require('./kafka-producer');

class OrderStateMachine {
  constructor(orderDetails, esClient) {
    this.orderDetails = orderDetails;
    this.esClient = esClient;
    this.states = ['Procesando', 'Preparación', 'Enviado', 'Entregado', 'Finalizado'];
    this.currentStateIndex = 0;
    this.currentState = this.states[this.currentStateIndex];
    this.stateTimes = {}; // Almacena los tiempos de cambio de estado
    this.startTime = Date.now(); // Tiempo de inicio del procesamiento del pedido
  }

  async start() {
    this.stateTimes[this.currentState] = Date.now(); // Tiempo de inicio del primer estado
    await this.updateState();
  }

  async updateState() {
    if (this.currentStateIndex < this.states.length) {
      const previousState = this.currentState;
      this.currentState = this.states[this.currentStateIndex];
      const now = Date.now();

      // Calcula latencia entre estados y almacena el tiempo del estado actual solo si ha cambiado
      if (this.stateTimes[previousState] && previousState !== this.currentState) {
        const latency = now - this.stateTimes[previousState];
        this.stateTimes[this.currentState] = now;
        console.log(`Latency from ${previousState} to ${this.currentState}: ${latency}ms`);

        // Enviar latencia a Elasticsearch en tiempo real si hay cambio de estado real
        await this.esClient.index({
          index: 'order_state_latency',
          body: {
            latency,
            timestamp: new Date(),
          },
        });
      } else {
        // Actualiza solo el tiempo de inicio del estado si es la primera entrada o si no hubo cambio real de estado
        this.stateTimes[this.currentState] = now;
      }

      // Actualiza el estado en `orderDetails` y envía el estado completo a Kafka
      this.orderDetails.status = this.currentState;
      await sendOrderStatusUpdate(this.orderDetails);

      this.currentStateIndex++;
      
      // Verificar si es el último estado ("Finalizado")
      if (this.currentState === 'Finalizado') {
        const totalProcessingTime = now - this.startTime; // Tiempo total de procesamiento
        console.log(`Order ${this.orderDetails.orderId} total processing time: ${totalProcessingTime}ms`);

        // Enviar métrica de tiempo total de procesamiento a Elasticsearch
        console.log(`Tiempo total de consulta ${totalProcessingTime}ms`);
        await this.esClient.index({
          index: 'performance_metrics',
          body: {
            totalProcessingTime,
            timestamp: new Date(),
          },
        });
      } else {
        // Configura el siguiente estado con un intervalo aleatorio
        const randomInterval = Math.floor(Math.random() * 5000) + 1000;
        setTimeout(() => this.updateState(), randomInterval);
      }
    }
  }

  getCurrentState() {
    return this.currentState;
  }
}

module.exports = OrderStateMachine;
