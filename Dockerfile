# Build with node
FROM node:22.6.0-slim AS builder

WORKDIR /usr/app

COPY package*.json ./.
RUN npm ci

COPY . .

RUN npm run build
# Serve with nginx unpprevileged
FROM nginxinc/nginx-unprivileged:stable

# copy server config
# TODO this config will change
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts
COPY --from=builder /usr/app/dist/ /usr/share/nginx/html