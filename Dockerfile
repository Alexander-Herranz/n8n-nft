# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copiamos package.json e instalamos dependencias
COPY package.json package-lock.json* ./
RUN npm ci

# Copiamos el código
COPY . .

# Exponemos el puerto y arrancamos con el mismo comando que localmente
EXPOSE 3000
CMD ["npm", "start"]

