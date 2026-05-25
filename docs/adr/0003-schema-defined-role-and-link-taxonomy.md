---
status: accepted
date: 2026-05-25
---

# Schema-defined role and link taxonomy

## Status

Accepted.

## Context

Technical articles, research papers, and API documentation use different role and link vocabularies. Baking one vocabulary into the compiler core would force unrelated document types to share the same semantics.

## Decision

Keep role and link type strings out of core validation rules. Schemas define allowed roles, allowed link types, and constraints. The first built-in schema is technical_article.

## Consequences

Core validators stay generic. New document types ship as schemas without changing compiler internals. Schema authors must provide diagnostic codes and messages for their constraints.
