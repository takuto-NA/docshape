# Library guide

This guide describes the compiler core and schema reference for docshape. For a feature overview, see [capabilities](guide/capabilities.md).

## Purpose

Docshape is a semantic document compiler for technical writing. It treats a document as a SemanticDocumentGraph: an ordered tree for structure and reading order, plus directed semantic links for meaning.

The MVP is LLM-independent. The graph is built in TypeScript, validated against a schema, then rendered to Markdown. Prose quality is not scored; structural obligations are.

## Current capabilities

| Capability | API | Notes |
|------------|-----|-------|
| Build a document graph bottom-up | `defineSemanticDocumentGraph`, `createSemanticDocumentNode` | Tree first, text later |
| Validate structure without prose | `compileStructural` | Empty sentence text is allowed |
| Validate before rendering | `compileRenderable` | Adds required-text checks |
| Use a built-in article schema | `technicalArticleSchema` | Roles, link types, constraints included |
| Define custom schemas | `defineDocumentSchema` | Role/link vocabulary lives in schemas, not Core |
| Render Markdown from tree order | `renderMarkdown` | Semantic links do not affect output order |
| Receive structured diagnostics | `CompileResult.diagnoses` | Stable codes, severities, node ids |
| Get edit suggestions | `Diagnosis.suggestedOperations` | PatchPlan types only; no auto-apply |
| Fill semantic fields before prose | `fillSemantic`, `compileFrameInstanceStructural` | Frame validates semantic readiness |
| Fill sentence prose for rendering | `fillProse`, `compileFrameInstanceRenderable` | Frame validates prose readiness |
| Author through DocumentFrame | `technicalArticleExplainerFrame` | Paragraph patterns, sentence patterns, semantic and prose fills |
| Expand frame instances to graphs | `expandFrameInstance`, `compileFrameInstance` | Sentence nodes may carry `semanticPayload` |

## Out of scope (MVP)

- Parsing existing Markdown into a graph
- LLM orchestration (Planner, Writer, Editor, and similar roles)
- Automatic PatchPlan execution
- CLI or language server
- Prose-style linting (see Vale and similar tools)

## Setup

```bash
npm install
npm run build
```

Import from the package entry point:

```typescript
import {
  compileStructural,
  compileRenderable,
  createSemanticDocumentNode,
  defineSemanticDocumentGraph,
  renderMarkdown,
  technicalArticleSchema,
} from "docshape";
```

## Authoring layers

Normal authoring starts from DocumentFrame. The frame expands into SemanticDocumentGraph, then the existing compiler validates and renders the graph.

```txt
DocumentFrame + semantic fills/deviations
  ↓ expand (semantic payload on sentences)
SemanticDocumentGraph
  ↓ compileStructural / compileRenderable (+ prose fills for renderable)
Diagnosis
  ↓ renderMarkdown
Markdown
```

See [DocumentFrame authoring](guide/frame-authoring.md).

## Core workflow

Low-level graph authoring:

```txt
Define SemanticDocumentGraph (tree + links)
  ↓
compileStructural(graph, schema)
  ↓
Fill sentence text
  ↓
compileRenderable(graph, schema)
  ↓
renderMarkdown(graph)
```

DocumentFrame authoring fills semantic fields first, then sentence prose. See [DocumentFrame authoring](guide/frame-authoring.md).

Structural compile checks graph shape, vocabulary, and link obligations. Renderable compile adds required-text checks.

## Data model

### Tree (reading order)

`children` is the canonical tree representation. Parent ids are derived during compile.

Allowed nesting:

```txt
document → section
section  → section, paragraph
paragraph → sentence
sentence → (leaf)
```

### Graph (meaning)

Each node may carry `links`. A link is source-active: the source node performs the relation toward the target.

Example: `reason` supports `claim` is modeled on the reason node as `{ type: "supports", targetId: "sentence-claim" }`.

Tree order controls Markdown layout. Link order does not.

Sentence nodes carry fine-grained meaning (`claim`, `evidence`, `reason`). Paragraph nodes can also carry composition roles (`background`, `summary`, and similar).

## Compile modes

### Structural compile

`compileStructural(graph, schema)` checks unique ids, layer nesting, schema roles, schema link types, link targets, declarative constraints, and optional predicate constraints. Text may be empty.

### Renderable compile

`compileRenderable(graph, schema)` runs structural checks, then applies `textRequiredRules`. For `technicalArticleSchema`, every sentence node must have non-empty text.

### Compile result

Returns `isValid`, `diagnoses`, and `metadata` (node index, parent lookup, incoming/outgoing link maps). `isValid` is `false` when any diagnosis has severity `error`.

## Built-in schema: technical_article

Import: `technicalArticleSchema`

Roles: `document`, `problem`, `goal`, `background`, `claim`, `reason`, `evidence`, `definition`, `example`, `assumption`, `constraint`, `design_decision`, `tradeoff`, `interface`, `algorithm`, `data_model`, `failure_mode`, `limitation`, `result`, `interpretation`, `summary`, `open_question` (`TECHNICAL_ARTICLE_ROLES`)

Link types: `supports`, `explains`, `defines`, `depends_on`, `contrasts_with`, `summarizes`, `motivates`, `implements` (`TECHNICAL_ARTICLE_LINK_TYPES`)

Sentence-level constraints (`TECHNICAL_ARTICLE_DIAGNOSTIC_CODES`):

| Role | Requirement | Code |
|------|-------------|------|
| `claim` | Incoming `supports` from `reason` or `evidence` | `TA-CLAIM-001` |
| `summary` | Outgoing `summarizes` | `TA-SUMMARY-001` |
| `design_decision` | Outgoing `depends_on` to `reason` or `constraint` | `TA-DECISION-001` |

## Core diagnostic codes

| Code | Meaning |
|------|---------|
| `DS-DUP-001` | Duplicate node id |
| `DS-LAY-001` | Invalid layer nesting |
| `DS-ROLE-001` | Role not allowed by schema |
| `DS-LINK-001` | Link type not allowed by schema |
| `DS-LINK-002` | Link target does not exist |
| `DS-TEXT-001` | Required text missing (renderable compile) |

Constant: `CORE_DIAGNOSTIC_CODES`

## Frame diagnostic codes

| Code | Meaning |
|------|---------|
| `FRAME-SEM-001` | Required semantic field missing |
| `FRAME-SEM-002` | Unknown semantic field |
| `FRAME-SEM-003` | Semantic value kind mismatch |
| `FRAME-PROSE-001` | Required sentence prose missing |
| `FRAME-PROSE-002` | Unknown prose sentence id |
| `FRAME-DEV-001` | Paragraph pattern omitted with a recorded reason (info) |
| `FRAME-FILL-001` | Unknown semantic or prose fill paragraph id |
| `FRAME-DEV-002` | Unknown deviation paragraph id |
| `FRAME-MISMATCH-001` | FrameInstance frameId does not match frame definition |
| `FRAME-DEV-003` | Deviation reason is empty |

Constant: `FRAME_DIAGNOSTIC_CODES`

## PatchPlan suggestions

When a schema constraint fails, the compiler may attach suggested operations to the diagnosis: `insert_paragraph`, `add_link`, or `split_paragraph` (type only in MVP). Suggestions are not applied automatically.

## Examples

- [Capabilities overview](guide/capabilities.md)
- [High-level frame script](../examples/library-usage-frame.mjs)
- [Low-level IR script](../examples/library-usage-article.mjs)
- [DocumentFrame walkthrough](guide/frame-authoring.md)
- [Low-level graph walkthrough](guide/example.md)

## Custom schemas

`defineDocumentSchema` accepts `allowedRoles`, `allowedLinkTypes`, `roleLinkConstraints`, `textRequiredRules`, and `predicateConstraints`. Core validators stay schema-driven.

## Verification

```bash
npm run verify
```

This runs typecheck, build, dist entrypoint smoke check, Vitest, and docguard. CI runs TypeScript verification and docguard on push and pull request.

Individual commands: `npm test`, `npm run typecheck`, `npm run build`, `npm run docs:check`, `uv run pytest`

Return to the [documentation index](index.md).
