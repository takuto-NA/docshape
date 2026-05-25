---
status: accepted
date: 2026-05-25
---

# DocumentFrame above SemanticDocumentGraph

## Status

Accepted.

## Context

The SemanticDocumentGraph API works as compiler IR, but authoring requires too much boilerplate. Examples that build even short articles repeat ids, layers, roles, links, and empty text fields across hundreds of lines.

Authors need a higher-level entry point that starts from a strong default document shape and allows explicit deviations.

## Decision

Introduce DocumentFrame as a separate layer above SemanticDocumentGraph. Frames provide default sections, slots, links, and expansion rules. Schema continues to own validation vocabulary and constraints. Normal authoring should happen through frames; direct graph construction remains available for compiler IR and advanced cases.

## Consequences

The public authoring path shifts from hand-written graphs to frame instances with fills and deviations. Built-in frames must expand into graphs that pass structural and renderable compile for their associated schema. SemanticDocumentGraph remains the intermediate representation consumed by the compiler.
