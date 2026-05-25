# Capabilities

This page summarizes what docshape can do in the current release.

## What docshape is

Docshape is a TypeScript semantic document compiler for technical writing. It validates structure, roles, semantic links, reading order, and concept references before prose is finalized. Prose quality is not scored; structural obligations are.

The MVP is LLM-independent. No Markdown parser or CLI is included yet.

## Semantic-first authoring

DocumentFrame authoring is semantic-first. Authors fill meaning before writing final sentence prose.

```txt
fillSemantic (paragraph-level fields)
  ↓ compileStructural
validate roles, links, Discourse Flow, Definition Flow, and required semantic fields
  ↓ fillProse (sentence-level text)
  ↓ compileRenderable
validate required prose and schema text rules
  ↓ renderMarkdown
Markdown
```

Construction units:

| Unit | Role |
|------|------|
| `ParagraphPatternDefinition` | Owns shared semantic fields and sentence patterns for one paragraph |
| `SentencePattern` | Defines one sentence role, required semantic fields, and prose requirement |
| `SemanticFill` | Typed values (`text`, `enum`, `reference`) keyed by field id |
| `ProseFill` | Final sentence text keyed by paragraph id and sentence id |

After expansion, sentence nodes may carry `semanticPayload` so meaning survives into compiler IR.

## Two authoring layers

| Layer | Use for | Entry API |
|-------|---------|-----------|
| DocumentFrame | Normal authoring | `technicalArticleExplainerFrame` |
| SemanticDocumentGraph | Compiler IR, advanced tooling | `defineSemanticDocumentGraph` |

Frame constructs default structure and validates semantic/prose readiness. Schema validates the expanded graph. See the [authoring pipeline](../guide.md#authoring-layers) in the library guide.

## Supported operations

### Author a technical explainer article

Use `technical_article.explainer` with `.fillSemantic()`, `.fillProse()`, and `.deviate()`. Structural compile can pass with complete semantic fields and empty prose. Renderable compile requires sentence prose.

See [DocumentFrame authoring](frame-authoring.md) and [examples/library-usage-frame.mjs](../../examples/library-usage-frame.mjs).

### Validate in two compile modes

| Mode | Frame checks | Schema checks | Empty sentence text |
|------|--------------|---------------|---------------------|
| Structural | Required semantic fields | Tree, roles, links, constraints, Discourse Flow, Definition Flow | Allowed |
| Renderable | Required sentence prose | Above plus required text rules | Not allowed for required sentences |

Frame helpers: `compileFrameInstanceStructural`, `compileFrameInstanceRenderable`.

### Inspect structured diagnostics

Compiler and frame layers return stable codes, severities, and node ids.

Core examples: `DS-DUP-001`, `DS-LAY-001`, `TA-CLAIM-001`, `TA-FLOW-001`, `TA-DEF-001`

Semantic frame examples: `FRAME-SEM-001`, `FRAME-PROSE-001`

Authoring examples: `FRAME-DEV-001`, `FRAME-MISMATCH-001`

### Serialize authoring state

`article.toFrameInstance()` returns JSON-serializable `frameId`, `title`, `semanticFills`, `proseFills`, `deviations`, and optional `idOverrides`.

### Expand frames programmatically

`expandFrameInstance(frame, instance)` and `getFrameById("technical_article.explainer")` support tooling that works on data, not fluent builders.

### Build low-level graphs directly

`defineSemanticDocumentGraph` and `createSemanticDocumentNode` remain available for compiler IR. See [low-level graph example](example.md) and [examples/library-usage-article.mjs](../../examples/library-usage-article.mjs).

### Render Markdown from tree order

`renderMarkdown(graph)` outputs headings and paragraphs from tree order. Semantic link order does not affect layout.

### Validate structural reader flow during compile

`technicalArticleSchema` applies link-existence rules, [Discourse Flow](discourse-flow.md) (`TA-FLOW-*`), and [Definition Flow](definition-flow.md) (`TA-DEF-*`) during structural compile. Overview and workflow: [Structural reader validation](structural-reader-validation.md).

### Validate Discourse Flow during structural compile

`technicalArticleSchema` rejects graphs where `supports`, `depends_on`, or `summarizes` links disagree with tree reading order — for example, a claim appearing before its supporting reason.

Codes: `TA-FLOW-001`, `TA-FLOW-002`, `TA-FLOW-003`. Full rules, examples, scope, and API: [Discourse Flow validation](discourse-flow.md).

### Validate Definition Flow during structural compile

`technicalArticleSchema` rejects graphs where `semanticPayload` reference fields point to missing nodes, non-definition nodes, or definitions that appear after use.

Codes: `TA-DEF-001`, `TA-DEF-002`, `TA-DEF-003`. Full rules, examples, scope, and frame-local reference aliases: [Definition Flow validation](definition-flow.md).

### Define custom schemas

`defineDocumentSchema` accepts role/link vocabularies and declarative constraints. Built-in: `technicalArticleSchema`.

## Built-in frame: technical_article.explainer

Sections: Introduction, Workflow, Compile modes, Summary.

Required author paragraph patterns:

- `introductionProblem` — fields: `domain`, `pain`; sentence: `problemStatement`
- `introductionGraphDefinition` — fields: `term`, `meaning`; sentence: `definitionStatement` (default semantic values provided)
- `introductionGoal` — fields: `solutionConcept` (reference), `solution`, `outcome`; sentence: `goalStatement`
- `workflowBackground` — field: `approach`; sentence: `workflowStatement`
- `workflowExample` — fields: `stepOne`, `stepTwo`, `stepThree`; sentences: `exampleStepOne` through `exampleStepThree`
- `summarySummary` — field: `takeaway`; sentence: `summaryStatement`

Recommended: `summaryLimitations` (omit with `.deviate(paragraphId, reason)`).

Default semantic values (no author fill required): `introductionGraphDefinition`, `workflowDesignDecision`, `workflowConstraint`, `compileModesClaim`, `compileModesReasonStructural`, `compileModesReasonRenderable`.

Default sentence links include design decision to constraint, reasons to claim, and summary to workflow and compile modes sections. Paragraph pattern order satisfies Discourse Flow; see [reading order](discourse-flow.md#authoring-impact). Concept references satisfy Definition Flow; see [concept availability](definition-flow.md#built-in-frame-impact).

## Out of scope

- Parsing existing Markdown into a graph
- LLM semantic field filling or prose generation
- Automatic PatchPlan execution
- CLI or language server
- Additional built-in frames (research paper, API docs, and similar)
- Prose-style linting
- Automatic paragraph reordering for Discourse Flow violations

## Setup and verification

See [Setup](../guide.md#setup) and [Verification](../guide.md#verification) in the library guide. For a runnable frame example, see [DocumentFrame authoring — runnable example](frame-authoring.md#runnable-example).

Expected result: structural valid before prose fill, renderable valid after prose fill, Markdown printed.

## Documentation map

- [Library guide](../guide.md) — data model, compile modes, schema reference
- [Structural reader validation](structural-reader-validation.md) — Discourse Flow + Definition Flow overview
- [Discourse Flow validation](discourse-flow.md) — reading-order rules and examples
- [Definition Flow validation](definition-flow.md) — concept reference rules and examples
- [DocumentFrame authoring](frame-authoring.md) — fluent API walkthrough
- [Low-level graph example](example.md)
- [Domain glossary](../../CONTEXT.md)
- [Architecture decisions](../adr/) — including [0006 Discourse Flow validation](../adr/0006-discourse-flow-validation.md) and [0007 Definition Flow validation](../adr/0007-definition-flow-validation.md)
