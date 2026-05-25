# Docshape

Docshape is a semantic document compiler for technical writing. It treats documents as typed graphs before prose is written.

## Language

**SemanticDocumentGraph**:
The typed intermediate representation of a technical document. It combines an ordered containment tree with schema-validated semantic links.
_Avoid_: DocGraph, document graph (without "semantic")

**DocumentFrame**:
A high-level document construction model that provides default sections, slots, semantic links, and expansion rules for a document family.
_Avoid_: template (when meaning only layout), preset (when meaning schema defaults only)

**Frame Slot**:
A named authoring position inside a DocumentFrame. A slot carries a role, section placement, slot requirement level, and fill or deviation state.
_Avoid_: field, placeholder (when meaning prose-only)

**FrameInstance**:
A JSON-serializable filled or partially filled instance of a DocumentFrame.
_Avoid_: draft, document object (when meaning rendered output)

**Deviation**:
An explicit, reasoned choice to omit a slot from the default DocumentFrame.
_Avoid_: skip, delete (when meaning silent removal)

**Tree**:
The ordered containment structure that determines section, paragraph, and sentence nesting and render order.
_Avoid_: hierarchy, outline (when meaning structural order)

**SemanticLink**:
A directed relationship from a source node to a target node, interpreted according to the active schema.
_Avoid_: edge, reference (when meaning prose cross-reference)

**Schema**:
The role and link vocabulary plus constraints that a SemanticDocumentGraph must satisfy. Schema validates structure; it does not provide default document layout.
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

**Developer**: I start from `technical_article.explainer`, fill problem and goal, then deviate from limitations with a reason.

**Domain expert**: Good. The frame expands into a SemanticDocumentGraph. Deviations become info diagnoses, not silent omissions.

**Developer**: Schema still validates roles and links after expansion. The frame only constructs the default shape.

**Domain expert**: Correct. Frame constructs. Schema validates. SemanticDocumentGraph remains compiler IR beneath both.
