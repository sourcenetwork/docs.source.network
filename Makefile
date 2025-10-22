.PHONY: version\:replace help

# Color codes for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[0;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

# Valid project names
VALID_PROJECTS := defradb sourcehub orbis lensvm

help:
	@echo "$(BLUE)Docusaurus Version Management$(NC)"
	@echo ""
	@echo "$(GREEN)Available commands:$(NC)"
	@echo "  make version:replace PROJECT=<project> VERSION=<version>"
	@echo ""
	@echo "$(GREEN)Description:$(NC)"
	@echo "  Regenerates and replaces Docusaurus versioned docs for a specific version"
	@echo ""
	@echo "$(GREEN)Arguments:$(NC)"
	@echo "  PROJECT  - Project name (defradb, sourcehub, orbis, lensvm)"
	@echo "  VERSION  - Version identifier (must exist in <project>_versions.json)"
	@echo ""
	@echo "$(GREEN)Example:$(NC)"
	@echo "  make version:replace PROJECT=defradb VERSION=0.19.0"
	@echo ""

version\:replace:
	@# Validate PROJECT argument
	@if [ -z "$(PROJECT)" ]; then \
		echo "$(RED)Error: PROJECT argument is required$(NC)"; \
		echo "Usage: make version:replace PROJECT=<project> VERSION=<version>"; \
		echo "Valid projects: $(VALID_PROJECTS)"; \
		exit 1; \
	fi
	@# Validate PROJECT is one of the valid projects
	@if ! echo "$(VALID_PROJECTS)" | grep -w "$(PROJECT)" > /dev/null; then \
		echo "$(RED)Error: Invalid PROJECT '$(PROJECT)'$(NC)"; \
		echo "Valid projects: $(VALID_PROJECTS)"; \
		exit 1; \
	fi
	@# Validate VERSION argument
	@if [ -z "$(VERSION)" ]; then \
		echo "$(RED)Error: VERSION argument is required$(NC)"; \
		echo "Usage: make version:replace PROJECT=$(PROJECT) VERSION=<version>"; \
		exit 1; \
	fi
	@# Check if versions.json file exists
	@if [ ! -f "$(PROJECT)_versions.json" ]; then \
		echo "$(RED)Error: $(PROJECT)_versions.json not found$(NC)"; \
		exit 1; \
	fi
	@# Validate VERSION exists in versions.json
	@if ! grep -q '"$(VERSION)"' "$(PROJECT)_versions.json"; then \
		echo "$(RED)Error: Version '$(VERSION)' not found in $(PROJECT)_versions.json$(NC)"; \
		echo "$(YELLOW)Available versions:$(NC)"; \
		cat "$(PROJECT)_versions.json"; \
		exit 1; \
	fi
	@echo "$(GREEN)Starting version replacement for $(PROJECT) v$(VERSION)$(NC)"
	@echo ""
	@# Step 0: Clean up any existing -replace version first
	@echo "$(BLUE)[0/5]$(NC) Cleaning up any existing replacement version"
	@if [ -d "$(PROJECT)_versioned_docs/version-$(VERSION)-replace" ]; then \
		rm -rf "$(PROJECT)_versioned_docs/version-$(VERSION)-replace"; \
		echo "$(YELLOW)  - Removed existing $(PROJECT)_versioned_docs/version-$(VERSION)-replace/$(NC)"; \
	fi
	@if [ -f "$(PROJECT)_versioned_sidebars/version-$(VERSION)-replace-sidebars.json" ]; then \
		rm -f "$(PROJECT)_versioned_sidebars/version-$(VERSION)-replace-sidebars.json"; \
		echo "$(YELLOW)  - Removed existing $(PROJECT)_versioned_sidebars/version-$(VERSION)-replace-sidebars.json$(NC)"; \
	fi
	@if grep -q '"$(VERSION)-replace"' "$(PROJECT)_versions.json"; then \
		sed -i.bak '/"$(VERSION)-replace"/d' "$(PROJECT)_versions.json"; \
		rm -f "$(PROJECT)_versions.json.bak"; \
		echo "$(YELLOW)  - Removed $(VERSION)-replace from $(PROJECT)_versions.json$(NC)"; \
	fi
	@echo "$(GREEN)✓ Cleanup complete$(NC)"
	@echo ""
	@# Step 1: Generate replacement version
	@echo "$(BLUE)[1/5]$(NC) Generating replacement version: $(VERSION)-replace"
	@npm run docusaurus docs:version:$(PROJECT) $(VERSION)-replace
	@if [ $$? -ne 0 ]; then \
		echo "$(RED)Error: Failed to generate replacement version$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)✓ Replacement version generated$(NC)"
	@echo ""
	@# Step 2: Remove original versioned docs directory
	@echo "$(BLUE)[2/5]$(NC) Removing original versioned docs directory"
	@if [ -d "$(PROJECT)_versioned_docs/version-$(VERSION)" ]; then \
		rm -rf "$(PROJECT)_versioned_docs/version-$(VERSION)"; \
		echo "$(GREEN)✓ Removed $(PROJECT)_versioned_docs/version-$(VERSION)/$(NC)"; \
	else \
		echo "$(YELLOW)⚠ Directory $(PROJECT)_versioned_docs/version-$(VERSION)/ not found, skipping$(NC)"; \
	fi
	@# Step 3: Remove original versioned sidebar file
	@echo "$(BLUE)[3/5]$(NC) Removing original versioned sidebar"
	@if [ -f "$(PROJECT)_versioned_sidebars/version-$(VERSION)-sidebars.json" ]; then \
		rm -f "$(PROJECT)_versioned_sidebars/version-$(VERSION)-sidebars.json"; \
		echo "$(GREEN)✓ Removed $(PROJECT)_versioned_sidebars/version-$(VERSION)-sidebars.json$(NC)"; \
	else \
		echo "$(YELLOW)⚠ File $(PROJECT)_versioned_sidebars/version-$(VERSION)-sidebars.json not found, skipping$(NC)"; \
	fi
	@echo ""
	@# Step 4: Rename replacement files to original
	@echo "$(BLUE)[4/5]$(NC) Renaming replacement files to original version"
	@if [ -d "$(PROJECT)_versioned_docs/version-$(VERSION)-replace" ]; then \
		mv "$(PROJECT)_versioned_docs/version-$(VERSION)-replace" "$(PROJECT)_versioned_docs/version-$(VERSION)"; \
		echo "$(GREEN)✓ Renamed versioned docs directory$(NC)"; \
	else \
		echo "$(RED)Error: $(PROJECT)_versioned_docs/version-$(VERSION)-replace not found$(NC)"; \
		exit 1; \
	fi
	@if [ -f "$(PROJECT)_versioned_sidebars/version-$(VERSION)-replace-sidebars.json" ]; then \
		mv "$(PROJECT)_versioned_sidebars/version-$(VERSION)-replace-sidebars.json" "$(PROJECT)_versioned_sidebars/version-$(VERSION)-sidebars.json"; \
		echo "$(GREEN)✓ Renamed versioned sidebar file$(NC)"; \
	else \
		echo "$(RED)Error: $(PROJECT)_versioned_sidebars/version-$(VERSION)-replace-sidebars.json not found$(NC)"; \
		exit 1; \
	fi
	@echo ""
	@# Step 5: Update versions.json to remove -replace entry (original version is already present)
	@echo "$(BLUE)[5/5]$(NC) Updating $(PROJECT)_versions.json"
	@sed -i.bak '/"$(VERSION)-replace"/d' "$(PROJECT)_versions.json"
	@rm -f "$(PROJECT)_versions.json.bak"
	@echo "$(GREEN)✓ Updated $(PROJECT)_versions.json$(NC)"
	@# Optional: Update docusaurus.config.js if version-replace config exists
	@if grep -q '"$(VERSION)-replace"' docusaurus.config.js 2>/dev/null; then \
		echo "$(BLUE)[BONUS]$(NC) Updating docusaurus.config.js"; \
		sed -i.bak 's/"$(VERSION)-replace"/"$(VERSION)"/' docusaurus.config.js; \
		rm -f docusaurus.config.js.bak; \
		echo "$(GREEN)✓ Updated docusaurus.config.js$(NC)"; \
	fi
	@echo ""
	@echo "$(GREEN)════════════════════════════════════════$(NC)"
	@echo "$(GREEN)✓ Version replacement complete!$(NC)"
	@echo "$(GREEN)════════════════════════════════════════$(NC)"
	@echo "$(BLUE)Project:$(NC) $(PROJECT)"
	@echo "$(BLUE)Version:$(NC) $(VERSION)"
	@echo ""
	@echo "$(YELLOW)Next steps:$(NC)"
	@echo "  1. Review the changes with: git status"
	@echo "  2. Test the docs locally with: npm run start"
	@echo "  3. Commit the changes when satisfied"
	@echo ""
