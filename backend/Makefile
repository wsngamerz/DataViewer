NAME := dataviewer
BINARY_NAME := dataviewer
BUILD_TARGET = build
ORG := wsngamerz
ORG_REPO := $(ORG)/$(NAME)
ROOT_PACKAGE := github.com/$(ORG_REPO)
MAIN_SRC_FILE=cmd/api/main.go
GO := GO111MODULE=on go
GO_NOMOD :=GO111MODULE=off go
REV := $(shell git rev-parse --short HEAD 2> /dev/null || echo 'unknown')
GO_DEPENDENCIES := $(call rwildcard,pkg/,*.go) $(call rwildcard,cmd/,*.go)
BRANCH     := $(shell git rev-parse --abbrev-ref HEAD 2> /dev/null  || echo 'unknown')
CGO_ENABLED = 0
GOTEST := $(GO) test
VERSION ?= $(shell echo "$$(git for-each-ref refs/tags/ --count=1 --sort=-version:refname --format='%(refname:short)' 2>/dev/null)-dev+$(REV)" | sed 's/^v//')

.PHONY: list
list: ## List all make targets
	@$(MAKE) -pRrn : -f $(MAKEFILE_LIST) 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | egrep -v -e '^[^[:alnum:]]' -e '^$@$$' | sort

.PHONY: help
.DEFAULT_GOAL := help
help:
	@grep -h -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

full: check ## Build and run the tests
check: build test ## Build and run the tests
get-test-deps: ## Install test dependencies
	$(GO_NOMOD) get github.com/axw/gocov/gocov
	$(GO_NOMOD) get -u gopkg.in/matm/v1/gocov-html

version: ## Print version
	@echo $(VERSION)

build: build-app

build-app: $(GO_DEPENDENCIES) ## Build API binary for current OS
	CGO_ENABLED=$(CGO_ENABLED) $(GO) $(BUILD_TARGET) $(BUILDFLAGS) -o build/$(BINARY_NAME) $(MAIN_SRC_FILE)

mocks: ## Generates mock implementations from interfaces
	mockery --all --dir internal/domain/ --output internal/domain/mocks

test: ## Run tests with the "unit" build tag
	CGO_ENABLED=$(CGO_ENABLED) $(GOTEST) --tags=unit -failfast -short ./... $(TEST_BUILDFLAGS)

.PHONY: clean
clean: ## Clean the generated artifacts
	rm -rf build release dist

get-fmt-deps: ## Install test dependencies
	$(GO_NOMOD) get golang.org/x/tools/cmd/goimports

.PHONY: fmt
fmt: importfmt ## Format the code
	$(eval FORMATTED = $(shell $(GO) fmt ./...))
	@if [ "$(FORMATTED)" == "" ]; \
      	then \
      	    echo "All Go files properly formatted"; \
      	else \
      		echo "Fixed formatting for: $(FORMATTED)"; \
      	fi

.PHONY: importfmt
importfmt: get-fmt-deps
	@echo "Formatting the imports..."
	goimports -w $(GO_DEPENDENCIES)

lint: ## Lints the code with golangci-lint
	golangci-lint run

.PHONY: all
all: fmt build test lint

.PHONY: mocks
mocks:  ## Generates mock implementations from interfaces
	mockery

.PHONY: run
run: mocks lint build ## Run the application
	./build/$(BINARY_NAME)
