# Capabilities

This page summarizes what docshape can do in the current release.

## What docshape is

Docshape is a TypeScript semantic document compiler for technical writing. It validates structure, roles, and semantic links before prose is finalized. Prose quality is not scored; structural obligations are.

The MVP is LLM-independent. No Markdown parser or CLI is included yet.

## Two authoring layers

| Layer | Use for | Entry API |
|-------|---------|-----------|
| DocumentFrame | Normal authoring | `technicalArticleExplainerFrame` |
| SemanticDocumentGraph | Compiler IR, advanced tooling | `defineSemanticDocumentGraph` |

Frame constructs default structure. Schema validates the expanded graph. See the [authoring pipeline](../guide.md#authoring-layers) in the library guide.

## Supported operations

### Author a technical explainer article

Use `technical_article.explainer` with the fluent API. Fill slots, deviate from recommended slots with a reason, then compile and render.

See [DocumentFrame authoring](frame-authoring.md) and [examples/library-usage-frame.mjs](../../examples/library-usage-frame.mjs) (36 lines).

### Validate in two compile modes

| Mode | API | Empty sentence text |
|------|-----|---------------------|
| Structural | `compileStructural` | Allowed |
| Renderable | `compileRenderable` | Not allowed for required sentences |

Frame helpers: `compileFrameInstanceStructural`, `compileFrameInstanceRenderable`.

### Inspect structured diagnostics

Compiler and frame layers return stable codes, severities, and node ids.

Core examples: `DS-DUP-001`, `DS-LAY-001`, `TA-CLAIM-001`

Frame examples: `FRAME-REQ-001`, `FRAME-DEV-001`, `FRAME-MISMATCH-001`

### Serialize authoring state

`article.toFrameInstance()` returns JSON-serializable `frameId`, `title`, `fills`, `deviations`, and optional `idOverrides`.

### Expand frames programmatically

`expandFrameInstance(frame, instance)` and `getFrameById("technical_article.explainer")` support tooling that works on data, not fluent builders.

### Build low-level graphs directly

`defineSemanticDocumentGraph` and `createSemanticDocumentNode` remain available for compiler IR. See [low-level graph example](example.md) and [examples/library-usage-article.mjs](../../examples/library-usage-article.mjs).

### Render Markdown from tree order

`renderMarkdown(graph)` outputs headings and paragraphs from tree order. Semantic link order does not affect layout.

### Define custom schemas

`defineDocumentSchema` accepts role/link vocabularies and declarative constraints. Built-in: `technicalArticleSchema`.

## Built-in frame: technical_article.explainer

Sections: Introduction, Workflow, Compile modes, Summary.

Author fill slots: `problem`, `goal`, `workflow`, `example`, `summary` (required); `limitations` (recommended, omit with `deviate`).

Auto-filled slots: design decision, workflow constraint, claim, compile-mode reasons, and default semantic links.

## Out of scope

- Parsing existing Markdown into a graph
- LLM slot filling or orchestration
- Automatic PatchPlan execution
- CLI or language server
- Additional built-in frames (research paper, API docs, and similar)
- Prose-style linting

## Setup and verification

See [Setup](../guide.md#setup) and [Verification](../guide.md#verification) in the library guide.

## Documentation map

- [Library guide](../guide.md) — data model, compile modes, schema reference
- [DocumentFrame authoring](frame-authoring.md) — fluent API and slot rules
- [Low-level graph example](example.md)
- [Domain glossary](../../CONTEXT.md)
- [Architecture decisions](../adr/)
