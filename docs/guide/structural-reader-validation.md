# Structural reader validation

Structural reader validation is graph-deterministic compile-time checking that a `SemanticDocumentGraph` is understandable in tree reading order before prose is finalized. It is not prose-style linting and does not use NLP.

Docshape applies three complementary layers during `compileStructural`. `compileRenderable` inherits the same schema diagnostics, then adds required-text checks.

## Three validation layers

| Layer | Question | Examples | Codes |
|-------|----------|----------|-------|
| Link existence | Are required semantic links present? | claim has incoming `supports` | `TA-CLAIM-001`, `TA-DECISION-001`, `TA-SUMMARY-001` |
| Discourse Flow | Do link semantics agree with tree reading order? | reason before claim, constraint before decision | `TA-FLOW-001..003` |
| Definition Flow | Are referenced concepts introduced before use? | definition before goal reference | `TA-DEF-001..003` |

A graph can pass one layer while failing another.

```txt
Passes link existence, fails Discourse Flow:
  claim before reason with supports link

Passes Discourse Flow, fails Definition Flow:
  goal references definition sentence that appears later
```

## Authoring workflow

```txt
fillSemantic (paragraph-level fields, including reference fields)
  ↓ expandFrameInstance (frame-local references resolve to node ids)
  ↓ compileStructural
validate link existence, Discourse Flow, Definition Flow
  ↓ fillProse (sentence text)
  ↓ compileRenderable
validate required prose and text rules
  ↓ renderMarkdown
Markdown from tree order
```

At the semantic-only stage:

- `compileStructural()` can be valid with empty sentence text.
- `renderMarkdown()` outputs headings only until prose is filled.
- `compileRenderable()` fails until required sentence text is present.

## Discourse Flow

Validates `supports`, `depends_on`, and `summarizes` against preorder tree spans. Built-in frame order places constraints before decisions, reasons before claims, and summaries after summarized sections.

Full rules, API, and examples: [Discourse Flow validation](discourse-flow.md).

## Definition Flow

Validates `semanticPayload` fields with `kind: "reference"`. Expanded graph references use node ids. Referenced nodes must have role `definition` and finish before the using node starts. Frame defaults may use `paragraphId::sentenceId` before expansion.

Built-in frame: `introductionGraphDefinition` defines `SemanticDocumentGraph`; `introductionGoal.solutionConcept` references that definition.

Full rules, API, and examples: [Definition Flow validation](definition-flow.md).

## Introduction example (built-in frame)

After prose fill, Introduction reads in this order:

```markdown
# Introduction
...problem...

A SemanticDocumentGraph is a typed graph of sections, paragraphs, sentences, and semantic links...

Docshape lets authors define a SemanticDocumentGraph first...
```

Definition precedes use. Reasons precede claims in Compile modes. Constraints precede design decisions in Workflow.

## Out of scope

Structural reader validation does not:

- Score prose readability or writing style
- Detect unknown terms inside `text` semantic values or sentence prose
- Reorder paragraphs automatically
- Generate prose from semantic fields
- Attach PatchPlan suggestions for flow violations

## Related documentation

- [Capabilities overview](capabilities.md)
- [Discourse Flow validation](discourse-flow.md)
- [Definition Flow validation](definition-flow.md)
- [DocumentFrame authoring](frame-authoring.md)
- [ADR 0006 — Discourse Flow](../adr/0006-discourse-flow-validation.md)
- [ADR 0007 — Definition Flow](../adr/0007-definition-flow-validation.md)
- Tests: `tests/discourse-flow.test.ts`, `tests/definition-flow.test.ts`

Return to the [documentation index](../index.md).
