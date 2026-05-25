# Definition Flow validation

Definition Flow checks whether semantic concept references are available to the reader before use. It runs during `compileStructural` on graphs validated with `technicalArticleSchema`. `compileRenderable` inherits the same diagnostics.

Discourse Flow validates link reading order. Definition Flow validates explicit concept references in `semanticPayload`.

## Problem it solves

A graph can use a concept in semantic fields before a definition node introduces it to the reader.

```txt
Bad flow (fails TA-DEF-003):
  goalStatement references SemanticDocumentGraph
  definitionStatement defines SemanticDocumentGraph
```

Definition Flow rejects this at structural compile, before prose generation or rendering.

## When it runs

| Compile mode | Definition Flow checked | Empty sentence text |
|--------------|-------------------------|---------------------|
| `compileStructural` | Yes | Allowed |
| `compileRenderable` | Yes (after structural checks) | Not allowed for required sentences |

Applies to any node carrying `semanticPayload` entries with `kind: "reference"`.

Severity is always `error`. Failures make `isValid` false.

## Rules

Reading order uses preorder tree spans `{ start, end }` from Discourse Flow helpers. A definition is available only after its subtree has been read.

| Condition | Code |
|-----------|------|
| Referenced node id does not exist | `TA-DEF-001` |
| Referenced node exists but role is not `definition` | `TA-DEF-002` |
| Definition subtree does not end before the using node starts | `TA-DEF-003` |

In an expanded `SemanticDocumentGraph`, `reference.value` must be a node id.

In frame definitions, default reference values may use `paragraphId::sentenceId` as a pre-expansion alias. `expandFrameInstance` resolves those aliases to generated node ids before schema compile.

### Good example

```txt
definitionStatement (role: definition)
goalStatement (semanticPayload.reference -> definitionStatement)
```

### Bad example

```txt
goalStatement (semanticPayload.reference -> definitionStatement)
definitionStatement (role: definition)
```

## Diagnostics

Each violating reference field on a node emits one diagnosis on that node.

Example:

```txt
code: TA-DEF-003
severity: error
nodeId: sentence-goal
message: Definition node "sentence-definition" must appear before using node "sentence-goal" in reading order.
```

Definition Flow diagnoses do not include PatchPlan suggestions in the current release.

## Built-in frame impact

`technical_article.explainer` adds required `introductionGraphDefinition` before `introductionGoal`.

- `introductionGraphDefinition` defines `SemanticDocumentGraph`.
- `introductionGoal` carries default `solutionConcept` reference to `introductionGraphDefinition::definitionStatement`, resolved during expansion.

Authors do not need to hand-write generated node ids when using frame defaults.

## Out of scope

Definition Flow does not:

- Parse prose or `text` semantic values for unknown terms
- Score readability or writing style
- Validate link types other than explicit `reference` semantic values
- Accept non-`definition` roles as concept providers in v1

## Related documentation

- [Structural reader validation](structural-reader-validation.md)
- [Discourse Flow validation](discourse-flow.md)
- [Capabilities — Definition Flow](capabilities.md#validate-definition-flow-during-structural-compile)
- [ADR 0007 — Definition Flow validation](../adr/0007-definition-flow-validation.md)
- [Domain glossary — Definition Flow](../../CONTEXT.md)
- Tests: `tests/definition-flow.test.ts`

Return to the [documentation index](../index.md).
