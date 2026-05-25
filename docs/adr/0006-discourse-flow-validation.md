---
status: accepted
date: 2026-05-25
---

# Discourse Flow validation in structural compile

## Status

Accepted

## Context

`technical_article` already validates that semantic links exist: claims require incoming `supports`, design decisions require outgoing `depends_on`, and summaries require outgoing `summarizes`. A graph can satisfy those rules while still reading abruptly because the containment tree presents conclusions before the reasons or constraints that justify them.

This is a structural quality problem, not a prose-style problem. The compiler should detect when link semantics and reading order disagree before rendering or NLP-based rewriting.

## Decision

Add **Discourse Flow** validation to `technicalArticleSchema` as predicate constraints evaluated during `compileStructural`. `compileRenderable` inherits the same diagnostics.

Rules are deterministic and graph-based:

- `supports`: the supporting source subtree must finish before the supported target starts.
- `depends_on`: the dependency target subtree must finish before the design decision source starts.
- `summarizes`: the summarized target subtree must finish before the summary source starts.

Reading order uses preorder tree spans `{ start, end }` for each node subtree. Section targets are available only after their full subtree has been read.

Diagnostic codes:

- `TA-FLOW-001` — supporting node appears after supported node
- `TA-FLOW-002` — dependency appears after design decision
- `TA-FLOW-003` — summarized target appears after summary

Emit flow diagnoses only from outgoing links on the node under evaluation to avoid duplicate predicate output.

## Consequences

- Structural compile now checks reader availability, not only link existence.
- Built-in `technical_article.explainer` paragraph order must place reasons and constraints before the claims and decisions they support.
- Low-level example graphs that encoded claim-before-reason order must be reordered.
- Flow validation stays schema-owned and does not introduce NLP or prose-style heuristics in Core.
- User-facing rules and examples: [Discourse Flow validation](../guide/discourse-flow.md).
