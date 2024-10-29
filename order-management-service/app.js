const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const kafka = require('kafkajs').Kafka;
const { Client } = require('@elastic/elasticsearch');
const OrderStateMachine = require('./state_machine');

const PROTO_PATH = './order.proto';
const kafkaClient = new kafka({ clientId: 'order-service', brokers: ['kafka:9092'] });
const producer = kafkaClient.producer();
producer.connect();

// Configura Elasticsearch
const esClient = new Client({ node: 'http://elasticsearch:9200' });

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const orderProto = grpc.loadPackageDefinition(packageDefinition);

const orders = {};
let totalProcessingTime = 0;
let totalOrders = 0;
let errors = 0;
let exceptions = 0;

async function createOrder(call, callback) {
    const orderId = Math.random().toString(36).substring(7);
    const orderDetails = { status: 'Procesando', orderId, ...call.request };

    orders[orderId] = orderDetails;
    const orderStateMachine = new OrderStateMachine(orderDetails, esClient);  // Pasamos esClient

    try {
        const startTime = Date.now();
        
        await orderStateMachine.start(); // Procesa el pedido
        
        const processingTime = Date.now() - startTime;
        totalProcessingTime += processingTime;
        totalOrders++;

        // Enviar métricas de consumo a Elasticsearch
        await esClient.index({
            index: 'order_metrics',
            body: {
                paymentGateway: orderDetails.paymentGateway,
                cardBrand: orderDetails.cardBrand,
                bank: orderDetails.bank,
                timestamp: new Date(),
                status: 'success',
                exceptions: 0,
            },
        });

        callback(null, { order_id: orderId, status: 'Procesando' });
    } catch (error) {
        console.error("Error in createOrder:", error);
        errors++;
        exceptions++;

        // Registro de errores en Elasticsearch
        await esClient.index({
            index: 'order_metrics',
            body: {
                orderId,
                error: error.message,
                timestamp: new Date(),
                status: 'error',
                exceptions: 1,
            },
        });

        callback({
            code: grpc.status.UNKNOWN,
            details: error.message
        });
    }
}

function main() {
    const server = new grpc.Server();
    server.addService(orderProto.OrderService.service, { createOrder });
    server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
        console.log('Order Management Service running on port 50051');
    });
}

main();
