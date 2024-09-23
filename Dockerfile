# Build with node
FROM node:22.6.0-slim AS builder

# Accept build arguments and set them as environment variables
ARG API_BASE_URL
ARG API_ROOTURL
ARG MEDIA_URL
ARG GEOCODER_URL
ENV MEDIA_URL=${MEDIA_URL}
ENV API_BASE_URL=${API_BASE_URL}
ENV API_ROOTURL=${API_ROOTURL}

WORKDIR /usr/app

COPY package*.json ./.
RUN npm ci

COPY . .

RUN apt-get update && apt-get install -y gettext-base
RUN envsubst < /usr/app/src/assets/configs/config.json.tmpl > /usr/app/src/assets/configs/config.json

RUN npm run build --localize

# Serve with nginx unpprevileged
FROM nginxinc/nginx-unprivileged:stable

# copy server config
# TODO this config will change
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts
COPY --from=builder /usr/app/dist/ /usr/share/nginx/html