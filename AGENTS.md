# Repository Guidelines

## Project Structure & Module Organization

This repository is a Shopify Online Store 2.0 theme. Page-level Liquid lives in `sections/`, reusable fragments in `snippets/` and `blocks/`, and global wrappers in `layout/`. JSON and Liquid storefront templates are under `templates/`; translations belong in `locales/`, while merchant-configurable settings live in `config/`.

JavaScript, images, and theme-delivered styles are stored in `assets/`. Tailwind source starts at `src/tailwind/index.css`, with component styles and dynamic-class safelists below `src/tailwind/`. Its compiled output is `assets/theme.css`.

## Build, Test, and Development Commands

Use pnpm; `pnpm-lock.yaml` is the authoritative lockfile.

- `pnpm install` installs Tailwind and other development dependencies.
- `pnpm tw:watch` rebuilds `assets/theme.css` while styles change.
- `pnpm tw:build` creates the minified production stylesheet.
- `pnpm dev` starts Shopify's local theme preview using the `dev` environment and syncs Theme Editor changes.
- `pnpm pull:dev` / `pnpm push:dev` synchronize with the development theme. Review remote changes before pushing.
- `pnpm push:main` deploys to the main theme; use it only after review.

The Shopify CLI must be available on your PATH for theme commands.

## Coding Style & Naming Conventions

Use two-space indentation in Liquid, JSON, JavaScript, and CSS. Follow existing Liquid whitespace-control patterns (`{%- ... -%}`), keep schema settings near their owning section, and preserve the surrounding JavaScript quote and semicolon style. Name theme files in kebab-case, such as `sections/featured-product.liquid`; use `snake_case` for Liquid variables and schema IDs. Prefer reusable snippets over duplicated markup. Change Tailwind source files, then regenerate `assets/theme.css`.

## Testing Guidelines

There is currently no automated test suite or coverage threshold. Before submitting, run `pnpm tw:build`, open affected templates through `pnpm dev`, and verify desktop/mobile layouts, Theme Editor settings, cart or product interactions, and browser-console errors. For locale or schema edits, validate the JSON syntax and exercise the corresponding editor controls.

## Commit & Pull Request Guidelines

Git history is not included in this checkout, so use concise, imperative commits with a clear scope, for example `fix: prevent duplicate cart submissions`. Keep generated CSS in the same commit as its source change. Pull requests should explain storefront impact, list manual checks, link the relevant issue, and include before/after screenshots for visual changes.

## Security & Configuration

`shopify.theme.toml` is ignored because it contains store-specific credentials. Never commit access tokens, customer data, or local `.shopify/` state.
