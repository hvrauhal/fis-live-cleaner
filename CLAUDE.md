# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single-file Tampermonkey userscript (`fis-results-prettier.user.js`) that rewrites FIS live-scoring result pages (`https://fis.live-scoring.com/*`) into a cleaner layout for TV display. No build, no tests, no dependencies — edits go straight into the userscript and users re-install via Tampermonkey's **Raw** import.

## Architecture

Everything lives in one IIFE:

1. **Inject `STYLE`** — a `<style>` block defining the `tm-*` CSS namespace (tabs, table, rank badges, podium rows, in-progress indicator).
2. **`extractAthletes(table)`** — scrapes each `tbody.result-table-entry` on the page. Reads cells by **numeric index** (e.g. `cells[10]` is the score, `cells[7..9]` are judge scores, `cells[11]` is best score). This coupling to FIS's DOM layout is the main fragility — if FIS changes column order, parsing breaks silently.
3. **`buildContainer()` + `renderPanes(container, athletes)`** — build once, re-render often. The container holds two tab panes (*By Rank*, *By Start Order*); `renderPanes` regenerates their `<table>` contents on every update. Tab-switch listeners are attached once and survive re-renders because only the panes' children are replaced.
4. **`tableToContainer` WeakMap** — maps each original `<table>` to its rebuilt container so updates go to the same view instead of creating duplicates. Entries are dropped if the container becomes disconnected.
5. **`applyEnhancements()`** — on each call, walks every `table.result-table` in the DOM, re-extracts athletes, and either updates the existing container (via `renderPanes`) or creates a new one. Idempotent and safe to call on every mutation.
6. **`MutationObserver` on `document.body`** — FIS updates scores by mutating the existing table cells in place, so we must re-render on mutations. The callback filters out mutations that originate inside our own `tm-container` (to avoid a feedback loop from our own re-renders) and debounces to one `applyEnhancements()` per animation frame.

## Development workflow

- Edit `fis-results-prettier.user.js` directly.
- Bump `@version` in the userscript header when releasing — Tampermonkey uses it to offer updates to installed users.
- To test: commit & push, then in Tampermonkey click the script's **update** action (pulls from the raw GitHub URL) or reinstall from the Raw view. There is no local dev server.
- When changing DOM scraping, verify against a live FIS results page — the cell indices are the contract with the upstream site.

## CSS namespace

All script-owned classes are prefixed `tm-` (Tampermonkey). Keep this prefix for any new classes to avoid colliding with FIS's own `ls-*` and `result-table*` classes.
