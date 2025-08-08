# Sane defaults
SHELL := /bin/bash
.ONESHELL:
.SHELLFLAGS := -eu -o pipefail -c
.DELETE_ON_ERROR:
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules

# ---------------------- COMMANDS ---------------------------
dev: # Start development server
	@echo "Starting development server.."
	cd public_html && python -m http.server 8000

format: # Format code with Biome
	@echo "Formatting code.."
	bunx --bun @biomejs/biome format --write .

lint: # Check code with Biome (formatting, linting, imports)
	@echo "Checking code.."
	bunx --bun @biomejs/biome check .

check: # Check formatting and linting with Biome
	@echo "Checking formatting and linting.."
	bunx --bun @biomejs/biome check .

test: # Run unit tests with Bun
	@echo "Running unit tests.."
	bun test tests/unit

test-unit: # Run unit tests only
	@echo "Running unit tests.."
	bun test tests/unit

test-coverage: # Run unit tests with coverage
	@echo "Running unit tests with coverage.."
	bun test tests/unit --coverage

test-integration: # Run integration tests with Playwright
	@echo "Running integration tests.."
	bunx playwright test tests/integration

test-all: # Run both unit and integration tests
	@echo "Running all tests.."
	@echo "Running unit tests.."
	bun test tests/unit
	@echo "Running integration tests.."
	bunx playwright test tests/integration

# -----------------------------------------------------------
# CAUTION: If you have a file with the same name as make
# command, you need to add it to .PHONY below, otherwise it
# won't work. E.g. `make run` wouldn't work if you have
# `run` file in pwd.
.PHONY: help

# -----------------------------------------------------------
# -----       (Makefile helpers and decoration)      --------
# -----------------------------------------------------------

.DEFAULT_GOAL := help
# check https://stackoverflow.com/questions/4842424/list-of-ansi-color-escape-sequences
NC = \033[0m
ERR = \033[31;1m
TAB := '%-20s' # Increase if you have long commands

# tput colors
red := $(shell tput setaf 1)
green := $(shell tput setaf 2)
yellow := $(shell tput setaf 3)
blue := $(shell tput setaf 4)
cyan := $(shell tput setaf 6)
cyan80 := $(shell tput setaf 86)
grey500 := $(shell tput setaf 244)
grey300 := $(shell tput setaf 240)
bold := $(shell tput bold)
underline := $(shell tput smul)
reset := $(shell tput sgr0)

help:
	@printf '\n'
	@printf '    $(underline)Available make commands:$(reset)\n\n'
	@# Print commands with comments
	@grep -E '^([a-zA-Z0-9_-]+\.?)+:.+#.+$$' $(MAKEFILE_LIST) \
		| grep -v '^env-' \
		| grep -v '^arg-' \
		| sed 's/:.*#/: #/g' \
		| awk 'BEGIN {FS = "[: ]+#[ ]+"}; \
		{printf "    make $(bold)$(TAB)$(reset) # %s\n", \
			$$1, $$2}'
	@grep -E '^([a-zA-Z0-9_-]+\.?)+:( +\w+-\w+)*$$' $(MAKEFILE_LIST) \
		| grep -v help \
		| awk 'BEGIN {FS = ":"}; \
		{printf "    make $(bold)$(TAB)$(reset)\n", \
			$$1}' || true
	@echo -e ""