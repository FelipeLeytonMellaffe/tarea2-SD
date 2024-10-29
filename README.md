# tarea2-SD

video: https://youtu.be/7kPIzKlNw44

#### Instalar dependencias de order-management-service:

```bash
cd order-management-service/
chmod +x wait-for-it.sh
npm install
```

#### instalar dependencias del cliente:

```bash
cd order-client/
pip install grpcio
pip install protobuf
```

#### Inicializar docker-compose:

```bash
docker-compose up --build
```

#### Ejecutar cliente (generar pedidos):
```bash
cd order-client/
python client.py
```
