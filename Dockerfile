# Etapa 1: Dependencias
FROM node:22.14-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Etapa 2: Build
FROM node:22.14-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Definimos una variable dummy para que prisma generate funcione (validación de config)
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npm run build

# Etapa 3: Producción (Runner)
FROM node:22.14-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Copiamos los archivos generados por el modo standalone
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# COPIAR TU ARCHIVO DE SOCKETS (server.mjs)
# Asegúrate de que este archivo esté en la raíz de tu proyecto
COPY --from=builder /app/server.mjs ./server.mjs
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.mjs ./prisma.config.mjs

# Instalar socket.io, prisma y dotenv (necesario para prisma.config.mjs)
RUN npm install socket.io prisma dotenv

EXPOSE 3001

# Ejecutamos tu servidor de sockets personalizado
CMD ["node", "server.mjs"]
