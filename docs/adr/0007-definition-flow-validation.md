---
status: accepted
date: 2026-05-25
---

# Definition Flow validation in structural compile

## Status

Accepted

## Context

Discourse Flow validates causal reading order for semantic links, but readers can still encounter unknown terms when prose or semantic text names a concept before any definition node introduces it.

The motivating case is `SemanticDocumentGraph` appearing in `introductionGoal` before the reader has a graph-level definition available. This is a concept-availability problem, not a prose-style problem.

## Decision

Add Definition Flow validation to `technicalArticleSchema` as predicate constraints evaluated during `compileStructural`. `compileRenderable` inherits the same diagnostics.

Rules are deterministic and graph-based:

- Validate `SemanticValue` entries with `kind: "reference"` in any node's `semanticPayload`.
- In expanded graphs, `reference.value` is a node id.
- Only nodes with role `definition` may introduce referenced concepts in v1.
- The definition subtree must finish before the using node starts in tree reading order.

Diagnostic codes:

- `TA-DEF-001` — referenced node id does not exist
- `TA-DEF-002` — referenced node is not role `definition`
- `TA-DEF-003` — definition appears after use

Frame authoring convenience:

- Frame default references may use `paragraphId::sentenceId` before expansion.
- `expandFrameInstance` resolves those aliases to generated node ids through the existing sentence reference lookup.
- Expanded graphs store resolved node ids only.

Built-in frame change:

- Add required `introductionGraphDefinition` before `introductionGoal`.
- Add default `solutionConcept` reference from goal to the definition sentence.

## Consequences

- Structural compile now checks concept availability through explicit semantic references.
- Built-in `technical_article.explainer` introduces `SemanticDocumentGraph` before goal references it.
- Low-level graph authors must place definition nodes before reference use and use node ids in references.
- Definition Flow stays schema-owned and does not parse prose text.
- User-facing rules and examples: [Definition Flow validation](../guide/definition-flow.md).
