const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'order-service',
  brokers: ['kafka:9092'],
  connectionTimeout: 10000, // 10 segundos
});

const producer = kafka.producer();

async function connectProducer() {
  try {
    await producer.connect();
    console.log("Producer connected to Kafka");
  } catch (error) {
    console.error("Failed to connect to Kafka. Retrying in 5 seconds...", error);
    setTimeout(connectProducer, 5000);
  }
}

connectProducer();

async function sendOrderStatusUpdate(orderDetails) {
  try {
    await producer.send({
      topic: 'order_status',
      messages: [
        {
          key: orderDetails.orderId,
          value: JSON.stringify(orderDetails) // Enviar el objeto completo
        }
      ]
    });
    console.log(`Order status update sent for order ${orderDetails.orderId}: ${orderDetails.status}`);
  } catch (error) {
    console.error("Failed to send message to Kafka", error);
  }
}

module.exports = sendOrderStatusUpdate;
