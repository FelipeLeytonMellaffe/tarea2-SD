import time
import json
from kafka import KafkaConsumer
from email_sender import send_email  # Importa la función de envío de correo

#time.sleep(10)
# Configuración del consumidor de Kafka
consumer = KafkaConsumer(
    'order_status',
    bootstrap_servers=['kafka:9092'],
    auto_offset_reset='earliest',
    enable_auto_commit=True,
    group_id='notification-service'
)

print("Notification Service is running...")

# Escuchar eventos de Kafka y enviar notificaciones
for message in consumer:
    event = json.loads(message.value)
    
    # Crear el cuerpo del correo con toda la información del pedido
    email_subject = f"Actualización de Pedido {event['orderId']}"
    email_body = (
        f"Su pedido ha cambiado al estado: {event['status']}\n\n"
        f"Detalles del Pedido:\n"
        f"Producto: {event['productName']}\n"
        f"Precio: ${event['price']}\n"
        f"Método de Pago: {event['paymentGateway']}\n"
        f"Marca de la Tarjeta: {event['cardBrand']}\n"
        f"Banco: {event['bank']}\n"
        f"Dirección de Envío: {event['shippingAddress']['address']}, {event['shippingAddress']['region']}\n"
        f"Correo Electrónico del Cliente: {event.get('customerEmail')}\n"
    )
    
    # Envía el correo usando la función importada
    send_email(event.get('customerEmail'), email_subject, email_body)
    print(f"Notificación enviada para el pedido {event['orderId']} con estado {event['status']}")
