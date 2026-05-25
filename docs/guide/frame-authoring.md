# DocumentFrame authoring

DocumentFrame is the normal authoring layer. SemanticDocumentGraph remains compiler IR beneath it.

## Purpose

A DocumentFrame provides default sections, paragraph patterns, sentence patterns, semantic links, and expansion rules. Authors fill semantic fields first, then add sentence prose. Schema still validates the expanded graph.

## Built-in frame: technical_article.explainer

Frame id: `technical_article.explainer`

Default sections:

- Introduction
- Workflow
- Compile modes
- Summary

Author-facing paragraph patterns include:

- `introductionProblem` (required)
- `introductionGraphDefinition` (required, default semantic values)
- `introductionGoal` (required, default concept reference to graph definition)
- `workflowBackground` (required)
- `workflowExample` (required, three sentence patterns)
- `summarySummary` (required)
- `summaryLimitations` (recommended, omit with `deviate`)

Default semantic values are provided for graph definition, design decision, workflow constraint, claim, and compile-mode reasons. Default links satisfy `technicalArticleSchema` constraints and [Discourse Flow](discourse-flow.md) reading order.

## Reading order and Discourse Flow

Paragraph patterns expand into a tree. Semantic links must agree with that reading order during structural compile. In the built-in frame, constraints and reasons appear before the decisions and claims they support. When authoring custom paragraph order or low-level graphs, follow [Discourse Flow validation](discourse-flow.md).

## Concept references and Definition Flow

Semantic reference fields (`kind: "reference"`) must point to definition nodes that appear earlier in the tree. The built-in frame defines `SemanticDocumentGraph` in `introductionGraphDefinition` before `introductionGoal` references it. Frame default references may use `paragraphId::sentenceId`; expansion resolves them to node ids. See [Definition Flow validation](definition-flow.md).

## Sentence patterns and semantic payload

Each paragraph pattern contains one or more sentence patterns. A sentence pattern defines:

- `sentenceId` — prose fill key
- `role` — schema role on the expanded sentence node
- `requiredSemanticFieldIds` — fields copied into `semanticPayload`
- `proseRequirement` — `required` or `optional` for renderable compile

Expanded graphs store referenced semantic values on sentence nodes. Prose goes into `text` only when provided through `.fillProse()`.

## Fluent API

```typescript
import { technicalArticleExplainerFrame } from "docshape";

let article = technicalArticleExplainerFrame("How to use docshape")
  .fillSemantic("introductionProblem", {
    domain: { kind: "text", value: "technical articles" },
    pain: { kind: "text", value: "missing support is hard to validate" },
  })
  .deviate("summaryLimitations", "This short article does not need a limitations section.");

article.compileStructural();

article = article.fillProse("introductionProblem", {
  problemStatement: "Technical articles written as prose are hard to validate.",
});

article.compileRenderable();
article.renderMarkdown();
```

## Serializable FrameInstance

```typescript
const instance = article.toFrameInstance();
```

`FrameInstance` stores `frameId`, `title`, `semanticFills`, `proseFills`, `deviations`, and optional `idOverrides`.

## Paragraph pattern requirements

| Requirement | Behavior |
|-------------|----------|
| required | Must have required semantic fields filled |
| recommended | Included by default; omit with `deviate(paragraphId, reason)` |
| optional | Included only when semantic fill is provided |

Reasoned deviations emit `FRAME-DEV-001` info diagnoses. Empty deviation reasons emit `FRAME-DEV-003` errors. Frame id mismatches emit `FRAME-MISMATCH-001` errors.

Full frame diagnostic code reference: [library guide — frame diagnostic codes](../guide.md#frame-diagnostic-codes).

## Runnable example

```bash
npm run build
node examples/library-usage-frame.mjs
```

The script shows semantic fill, structural compile, prose fill, renderable compile, and Markdown output.

## When to use frames versus graphs

Use DocumentFrame for normal authoring. Use SemanticDocumentGraph directly for compiler IR, advanced customization, or tooling that already emits low-level graphs.

Return to the [library guide](../guide.md).
