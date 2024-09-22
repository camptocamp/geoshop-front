VERSION ?= $(shell git describe --always --tags)
DOCKER_TAG ?= latest

export DOCKER_BUILDKIT=1

# Load environment variables from .env file
ifneq (,$(wildcard .env))
    include .env
    export $(shell sed 's/=.*//' .env)
endif

.DEFAULT_GOAL := help

.PHONY: install
install: ## Install npm dependencies
	npm install

.PHONY: build
build: install ## Build npm project
	npm run build

.PHONY: build_docker
build_docker: ## Build docker image
	docker build --tag=camptocamp/geoshop-front:$(VERSION) \
		--build-arg=VERSION=$(VERSION) \
		--build-arg=API_URL=$(API_URL) \
		--build-arg=MEDIA_URL=$(MEDIA_URL) .
	docker tag camptocamp/geoshop-front:$(VERSION) camptocamp/geoshop-front:$(DOCKER_TAG)

.PHONY: build_ghcr
build_ghcr: ## Build docker image tagged for GHCR
	docker build --tag=ghcr.io/camptocamp/geoshop-front:$(VERSION) \
		--build-arg=VERSION=$(VERSION) \
		--build-arg=API_URL=$(API_URL) \
		--build-arg=MEDIA_URL=$(MEDIA_URL) .
	docker tag ghcr.io/camptocamp/geoshop-front:$(VERSION) ghcr.io/camptocamp/geoshop-front:$(DOCKER_TAG)

.PHONY: push_ghcr
push_ghcr: ## Push docker image to GHCR
	docker push ghcr.io/camptocamp/geoshop-front:$(VERSION)
	docker push ghcr.io/camptocamp/geoshop-front:$(DOCKER_TAG)

.PHONY: test
test: install ## Run tests
	npm test

.PHONY: help
help: ## Display this help
	@echo "Usage: make <target>"
	@echo
	@echo "Available targets:"
	@grep --extended-regexp --no-filename '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "	%-20s%s\n", $$1, $$2}'
