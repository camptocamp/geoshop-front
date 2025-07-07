# Build with node
FROM node:22.6.0-slim AS builder

WORKDIR /usr/app

COPY package*.json ./.
RUN npm ci  --legacy-peer-deps


COPY . .

RUN  npm i @angular/cli@19.2.15 && \
     npm ci && npm run build -- --localize
     
# Serve with nginx unpprevileged
FROM nginxinc/nginx-unprivileged:stable

# copy server config
# TODO this config will change
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts
COPY --from=builder /usr/app/dist/browser/de /usr/share/nginx/html/de
COPY --from=builder /usr/app/dist/browser/en /usr/share/nginx/html/en
COPY --from=builder /usr/app/dist/browser/fr /usr/share/nginx/html/fr
