# DocumentFrame authoring

DocumentFrame is the normal authoring layer. SemanticDocumentGraph remains compiler IR beneath it.

## Purpose

A DocumentFrame provides default sections, slots, semantic links, and expansion rules. Authors fill slots and explicitly deviate from the frame when needed. Schema still validates the expanded graph.

## Built-in frame: technical_article.explainer

Frame id: `technical_article.explainer`

Default sections:

- Introduction
- Workflow
- Compile modes
- Summary

Author-facing fill slots:

- `problem` (required)
- `goal` (required)
- `workflow` (required)
- `example` (required, multi-sentence via newline-separated text)
- `summary` (required)
- `limitations` (recommended, omit with `deviate`)

Default slot text is provided for design decision, workflow constraint, claim, and compile-mode reasons. Default links satisfy `technicalArticleSchema` constraints.

## Fluent API

```typescript
import { technicalArticleExplainerFrame } from "docshape";

const article = technicalArticleExplainerFrame("How to use docshape")
  .fill({
    problem: "Technical articles written as prose are hard to validate.",
    goal: "Docshape validates structure before rendering Markdown.",
    workflow: "Define the frame, compile structurally, fill text, then render.",
    example: "Step 1: define the graph.\nStep 2: compile.\nStep 3: render.",
    summary: "Docshape turns a filled frame into a valid SemanticDocumentGraph.",
  })
  .deviate("limitations", "This short article does not need a limitations section.");

article.compileStructural();
article.compileRenderable();
article.renderMarkdown();
```

## Serializable FrameInstance

```typescript
const instance = article.toFrameInstance();
```

`FrameInstance` stores `frameId`, `title`, `fills`, `deviations`, and optional `idOverrides`.

## Slot requirements

| Requirement | Behavior |
|-------------|----------|
| required | Must have fill text or default text |
| recommended | Included by default; omit with `deviate(slotId, reason)` |
| optional | Included only when fill text is provided |

Reasoned deviations emit `FRAME-DEV-001` info diagnoses. Empty deviation reasons emit `FRAME-DEV-003` errors. Frame id mismatches emit `FRAME-MISMATCH-001` errors.

Full frame diagnostic code reference: [library guide — frame diagnostic codes](../guide.md#frame-diagnostic-codes).

## Runnable example

```bash
npm run build
node examples/library-usage-frame.mjs
```

The script authors the library usage article theme in 36 lines and prints compile results plus Markdown.

## When to use frames versus graphs

Use DocumentFrame for normal authoring. Use SemanticDocumentGraph directly for compiler IR, advanced customization, or tooling that already emits low-level graphs.

Return to the [library guide](../guide.md).
