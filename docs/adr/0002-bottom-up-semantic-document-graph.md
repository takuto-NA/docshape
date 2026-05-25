---
status: accepted
date: 2026-05-25
---

# Bottom-up SemanticDocumentGraph construction

## Status

Accepted.

## Context

Technical documents can be authored as prose first or as structure first. Markdown-first parsing encourages free-form writing and makes role and link validation a secondary step.

## Decision

Build Docshape around bottom-up SemanticDocumentGraph construction. Users define tree structure, roles, and semantic links before filling sentence text. Markdown is a render target, not the primary input format for the MVP core.

## Consequences

Structural compile can succeed while text is empty. Existing Markdown import becomes a later workflow. The compiler API centers on graph construction, validation, and rendering rather than parsing.
