# Discourse Flow validation

Discourse Flow checks whether semantic links are available to the reader in tree reading order. It runs during `compileStructural` on graphs validated with `technicalArticleSchema`. `compileRenderable` inherits the same diagnostics.

Link-existence rules (`TA-CLAIM-001`, `TA-DECISION-001`, `TA-SUMMARY-001`) and Discourse Flow rules are separate. A graph can pass link existence while failing flow.

## Problem it solves

A valid graph can still read abruptly when the containment tree presents a conclusion before the reason or constraint that supports it.

```txt
Bad flow (passes TA-CLAIM-001, fails TA-FLOW-001):
  claimStatement
  reasonStatement --supports--> claimStatement
```

The reader sees the claim before the supporting reason is available. Discourse Flow rejects this at structural compile, before prose generation or rendering.

## When it runs

| Compile mode | Discourse Flow checked | Empty sentence text |
|--------------|------------------------|---------------------|
| `compileStructural` | Yes | Allowed |
| `compileRenderable` | Yes (after structural checks) | Not allowed for required sentences |

Applies to:

- Low-level graphs built with `defineSemanticDocumentGraph`
- Graphs expanded from `technical_article.explainer` and other frames using `technicalArticleSchema`

Severity is always `error`. Flow failures make `isValid` false.

## Rules

Reading order uses preorder tree spans `{ start, end }` for each node subtree. A node is considered read only after its entire subtree has been read.

| Link type | Source | Target | Valid when | Code |
|-----------|--------|--------|------------|------|
| `supports` | reason, evidence | claim | source subtree ends before target starts | `TA-FLOW-001` |
| `depends_on` | design_decision | reason, constraint | target subtree ends before source starts | `TA-FLOW-002` |
| `summarizes` | summary | any summarized node | target subtree ends before summary source starts | `TA-FLOW-003` |

Section targets use the full section subtree, not the section heading position alone.

### supports

```txt
Good:
  reasonStatement --supports--> claimStatement
  claimStatement

Bad:
  claimStatement
  reasonStatement --supports--> claimStatement
```

Place the supporting paragraph before the supported claim paragraph in the tree.

### depends_on

```txt
Good:
  constraintStatement
  designDecisionStatement --depends_on--> constraintStatement

Bad:
  designDecisionStatement --depends_on--> constraintStatement
  constraintStatement
```

Place the dependency before the design decision paragraph.

### summarizes

```txt
Good:
  workflowSection (full subtree)
  summaryStatement --summarizes--> workflowSection

Bad:
  summaryStatement --summarizes--> workflowSection
  workflowSection (remaining paragraphs still unread)
```

A summary inside a section cannot summarize that same section until the rest of the section subtree has been read.

## Diagnostics

Each violating outgoing link emits one diagnosis on the source node. Incoming links are not re-evaluated on the target node, so duplicate flow diagnoses are avoided.

Example diagnosis:

```txt
code: TA-FLOW-001
severity: error
nodeId: sentence-reason
message: Supporting node "sentence-reason" must appear before supported node "sentence-claim" in reading order.
```

Flow diagnoses do not include PatchPlan suggestions in the current release. Role and link existence constraints may still attach suggestions separately.

## Authoring impact

### DocumentFrame

`technical_article.explainer` paragraph patterns are ordered for Discourse Flow:

- Workflow: `workflowConstraint` before `workflowDesignDecision`
- Compile modes: `compileModesReasonStructural` and `compileModesReasonRenderable` before `compileModesClaim`
- Summary: after Workflow and Compile modes sections

Authors do not need extra configuration when using the built-in frame defaults.

### Low-level graphs

Authors must order paragraphs and sections so tree reading order matches link semantics. See [low-level graph example](example.md) and [examples/library-usage-article.mjs](../../examples/library-usage-article.mjs).

## API

```typescript
import { compileStructural, technicalArticleSchema } from "docshape";

const result = compileStructural(graph, technicalArticleSchema);

if (!result.isValid) {
  const flowDiagnoses = result.diagnoses.filter((diagnosis) =>
    diagnosis.code.startsWith("TA-FLOW-"),
  );
}
```

Constants: `TECHNICAL_ARTICLE_DIAGNOSTIC_CODES.flowSupportAfterClaim` (`TA-FLOW-001`), `flowDependencyAfterDecision` (`TA-FLOW-002`), `flowSummaryBeforeTarget` (`TA-FLOW-003`).

## Out of scope

Discourse Flow does not:

- Score prose style, readability, or natural language quality
- Validate reading order for link types other than `supports`, `depends_on`, and `summarizes`
- Reorder paragraphs automatically
- Attach PatchPlan suggestions for flow violations

These boundaries keep validation graph-deterministic and schema-owned.

## Related documentation

- [Capabilities — Discourse Flow](capabilities.md#validate-discourse-flow-during-structural-compile)
- [Library guide — technical_article schema](../guide.md#built-in-schema-technical_article)
- [DocumentFrame authoring](frame-authoring.md#reading-order-and-discourse-flow)
- [ADR 0006 — Discourse Flow validation](../adr/0006-discourse-flow-validation.md)
- [Domain glossary — Discourse Flow](../../CONTEXT.md)
- Tests: `tests/discourse-flow.test.ts`

Return to the [documentation index](../index.md).
