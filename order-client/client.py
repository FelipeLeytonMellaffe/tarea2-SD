import asyncio
import grpc
import json
import order_pb2
import order_pb2_grpc

async def create_order(order):
    async with grpc.aio.insecure_channel('localhost:50051') as channel:
        stub = order_pb2_grpc.OrderServiceStub(channel)

        # Crea la solicitud de orden usando los datos del pedido
        order_request = order_pb2.OrderRequest(
            product_name=order["product_name"],
            price=order["price"],
            payment_gateway=order["payment_gateway"],
            card_brand=order["card_brand"],
            bank=order["bank"],
            shipping_address=order_pb2.ShippingAddress(
                region=order["shipping_address"]["region"],
                address=order["shipping_address"]["address"]
            ),
            customer_email=order["customer_email"]
        )
        
        # Envía la orden y recibe la respuesta de forma asíncrona
        response = await stub.CreateOrder(order_request)
        #print(f"Order ID: {response.order_id}, Status: {response.status}")

async def main():
    # Carga las órdenes desde el archivo dataset.json
    with open('dataset.json', 'r') as file:
        orders = json.load(file)

    # Ejecuta todas las solicitudes de orden de forma concurrente
    tasks = [create_order(order) for order in orders]
    await asyncio.gather(*tasks)

if __name__ == "__main__":
    asyncio.run(main())
