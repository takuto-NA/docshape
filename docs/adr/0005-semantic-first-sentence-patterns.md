---
status: accepted
date: 2026-05-25
---

# Semantic-first SentencePattern frames

## Status

Accepted

## Context

The first DocumentFrame implementation treated paragraph slots as prose strings. Authors called `.fill({ problem: "..." })`, and expansion copied finished text directly into sentence nodes. That made the frame layer a shortcut for Markdown-like authoring instead of a semantic construction layer.

The intended workflow is bottom-up: assemble meaning first, validate structure, then add prose for rendering.

## Decision

Replace prose-first frame slots with paragraph patterns and sentence patterns.

- `ParagraphPatternDefinition` owns shared semantic fields.
- `SentencePattern` defines role, required semantic fields, and prose requirement per sentence.
- `FrameInstance` stores `semanticFills` and `proseFills` separately.
- Structural compile validates required semantic fields at the frame layer.
- Renderable compile additionally validates required sentence prose at the frame layer.
- Expanded sentence nodes may carry optional `semanticPayload`.
- Schema continues to validate tree shape, roles, links, and graph constraints only.

## Consequences

- Authors can structurally compile before writing final prose.
- Frame diagnostics split into `FRAME-SEM-*` and `FRAME-PROSE-*` namespaces.
- The old `.fill()` API is removed rather than kept as a compatibility shim.
- Built-in `technical_article.explainer` is the first migrated frame.
- Low-level graph users can still omit `semanticPayload`.
