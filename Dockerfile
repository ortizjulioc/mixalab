# Etapa 1: Instalación de dependencias
FROM node:22.14-alpine AS deps
# Instalamos dependencias necesarias para Prisma en Alpine Linux
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package*.json ./
# Instalamos las dependencias ignorando conflictos de versiones (peer dependencies)
RUN npm install --legacy-peer-deps

# Etapa 2: Construcción (Build)
FROM node:22.14-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generamos el cliente de Prisma (usa las variables del panel de Dokploy)
RUN npx prisma generate
# Compilamos Next.js
RUN npm run build

# Etapa 3: Producción (Runner)
FROM node:22.14-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production

# Copiamos solo los archivos necesarios para la ejecución
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Puerto que configuraste en Dokploy
EXPOSE 3001

# Comando de inicio asegurando que escuche en todas las interfaces
CMD ["npm", "start", "--", "-p", "3001", "-H", "0.0.0.0"]