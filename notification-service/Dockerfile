# Usa Python
FROM python:3.9
WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install -r requirements.txt

# Copia todos los archivos, incluido wait-for-it.sh
COPY . .

# Da permisos de ejecución al script wait-for-it.sh
RUN chmod +x wait-for-it.sh

# Define el comando por defecto, pero ahora será sobreescrito por docker-compose
#CMD ["python", "app.py"]
