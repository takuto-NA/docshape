# Docshape

Docshape is a semantic document compiler for technical writing. It treats documents as typed graphs before prose is written.

## Language

**SemanticDocumentGraph**:
The typed intermediate representation of a technical document. It combines an ordered containment tree with schema-validated semantic links.
_Avoid_: DocGraph, document graph (without "semantic")

**Tree**:
The ordered containment structure that determines section, paragraph, and sentence nesting and render order.
_Avoid_: hierarchy, outline (when meaning structural order)

**SemanticLink**:
A directed relationship from a source node to a target node, interpreted according to the active schema.
_Avoid_: edge, reference (when meaning prose cross-reference)

**Schema**:
The role and link vocabulary plus constraints that a SemanticDocumentGraph must satisfy.
_Avoid_: template, document type (when meaning only layout)

**Structural Compile**:
Validation that graph shape, roles, links, and constraints are coherent. Sentence text may be empty.
_Avoid_: lint, validate (without compile mode)

**Renderable Compile**:
Validation that a SemanticDocumentGraph can be rendered as a document. Required text must be present.
_Avoid_: publish check, final review

**Diagnosis**:
A compiler finding with severity error, warning, or info.
_Avoid_: violation, issue (when meaning compiler output)

**PatchPlan**:
A suggested set of graph editing operations that may address diagnoses. MVP defines types and suggestions only, not execution.
_Avoid_: fix plan, rewrite plan

## Example dialogue

**Developer**: I built the skeleton first. The claim sentence has no text yet, but structural compile passes.

**Domain expert**: Good. Structural compile checks roles and links. Renderable compile should fail until the claim sentence has text.

**Developer**: The summary paragraph links to the method section with summarizes. Tree order decides Markdown output, not link order.

**Domain expert**: Correct. Semantic links express meaning. The tree expresses reading order.
