# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Source Network documentation site, built with Docusaurus 3. It hosts documentation for four main products:
- **DefraDB**: A peer-to-peer database with Merkle CRDTs
- **SourceHub**: Access control and policy management
- **Orbis**: Multi-party computation and encryption
- **LensVM**: Virtual machine component

The site uses the `docusaurus-preset-openapi` for API documentation and auto-generates sidebars from the docs folder structure.

## Common Commands

```bash
# Install dependencies
npm install

# Start local development server (with hot reload)
npm run start

# Build for production
npm run build

# Serve production build locally
npm run serve

# Type checking
npm run typecheck

# Clear Docusaurus cache
npm run clear

# Import DefraDB CLI docs from upstream repository
# Usage: npm run import-defradb-cli-docs [commit-hash-or-branch]
npm run import-defradb-cli-docs develop
```

## Architecture

### Documentation Structure

Documentation is organized by product in the `/docs` directory:
- `/docs/defradb/` - DefraDB database documentation
- `/docs/sourcehub/` - SourceHub access control documentation
- `/docs/orbis/` - Orbis cryptography documentation
- `/docs/lensvm/` - LensVM documentation

Each product section typically contains:
- `getting-started.md` or `getting-started/` - Onboarding guides
- `concepts/` - Conceptual explanations
- `guides/` - How-to guides
- `references/` - Reference documentation (CLI, API)
- `release notes/` - Version release notes

### Sidebar Configuration

Sidebars are defined in `sidebars.js` with four main sections:
- `defraSidebar` - Auto-generated from `docs/defradb/`
- `sourcehubSidebar` - Auto-generated from `docs/sourcehub/` + API link
- `orbisSidebar` - Auto-generated from `docs/orbis/`
- `lensvmSidebar` - Auto-generated from `docs/lensvm/`

The changelog/release notes sidebar items are automatically reversed (newest first) via the `reverseSidebarChangelog()` function in `docusaurus.config.js:185-194`.

### API Documentation

OpenAPI specification is stored in `openapi.yml` at the root. The SourceHub API docs are served at `/sourcehub/api` via the `docusaurus-preset-openapi` plugin configuration.

### Theme Customization

Custom theme components are in `/src/theme/` using Docusaurus swizzling:
- Custom footer components with Source Network branding
- Custom color mode toggle
- SCSS styling in `/src/css/custom.scss`
- Custom code theme in `/src/code-theme/code-theme.js`

The site uses dark mode by default with `respectPrefersColorScheme: false`.

### CLI Documentation Import

The script `scripts/import-defradb-cli-docs.js` imports CLI reference docs from the DefraDB repository:
- Clones the DefraDB repo at a specific commit/branch
- Extracts markdown files from `docs/cli/` directory
- Transforms headers (removes one level, removes "defradb" prefix)
- Outputs to `docs/defradb/references/cli/`

Usage: `npm run import-defradb-cli-docs <commit-hash-or-branch>`

## Development Notes

- Documentation files support both `.md` (CommonMark) and `.mdx` (MDX) formats
- The edit URL for all docs points to the GitHub repo master branch
- Algolia search is configured with app ID `N3M9YBYYQY`
- Site is deployed automatically via Cloudflare Pages
- GitHub edit links are configured to point to the master branch
