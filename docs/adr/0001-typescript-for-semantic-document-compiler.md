---
status: accepted
date: 2026-05-25
---

# TypeScript for the semantic document compiler core

## Status

Accepted.

## Context

Docshape needs a reusable compiler core that other projects can import. The team considered TypeScript and Python. Python fits research and NLP workflows, but the first deliverable is a library for typed graph construction, validation, and rendering.

## Decision

Implement the SemanticDocumentGraph core in TypeScript as an npm package. Keep documentation guard checks in Python through docguard. Expose CLI usage later so consumers are not tied to the implementation language.

## Consequences

TypeScript consumers get editor support for graph and schema authoring. Python-based document tooling can still call the compiler through a future CLI. The repository now hosts both a Python documentation gate and a TypeScript library.
