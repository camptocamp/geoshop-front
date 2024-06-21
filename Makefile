.PHONY: help
help: ## Display this help message
	@echo "Usage: make <target>"
	@echo
	@echo "Available targets:"
	@grep --extended-regexp --no-filename '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "	%-20s%s\n", $$1, $$2}'

.PHONY: serve
serve: ## Run the development server
	python manage.py runserver

.PHONY: test
test: ## Run the test suite
	python manage.py test

.PHONY: superuser
superuser: ## Create a superuser
	python manage.py createsuperuser

.PHONY: translations
translations: ## update/create the po files
	python manage.py makemessages -a -i ".venv/*"

.PHONY: compile-translations
compile-translations: ## compile the po files into the mo files
	python manage.py compilemessages -i ".venv/*"

.PHONY: translate-compile
translate-compile: translations compile-translations ## update/create the po files and compile them into the mo files
