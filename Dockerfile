FROM ubuntu:oracular AS builder
LABEL Maintainer="andrey.rusakov@camptocamp.com" Vendor="Camptocamp"

WORKDIR /app/geoshop_back/
COPY . /app/geoshop_back/

RUN apt update && \
    apt upgrade -y && \
    apt install -y bash postgresql curl \
                   python3 python3-poetry python3-setuptools gunicorn \
                   libgdal-dev libffi-dev && \
    cd /app/geoshop_back/ && \
    poetry update && \
    poetry install --no-root
