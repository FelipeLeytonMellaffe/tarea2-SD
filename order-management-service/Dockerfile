# Dockerfile de order-management-service
FROM node:18

WORKDIR /app

# Copiar los archivos de la aplicación
COPY . .

# Copiar wait-for-it.sh y darle permisos de ejecución
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Instalar dependencias
RUN npm install

# Exponer el puerto que usa el servicio
EXPOSE 50051

# Comando de inicio (ver paso 3)
