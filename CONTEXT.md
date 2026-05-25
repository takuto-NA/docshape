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

The role and link vocabulary plus constraints that a SemanticDocumentGraph must satisfy. Schema validates structure; it does not provide default document layout.

_Avoid_: template, document type (when meaning only layout)

**Structural Compile**:

Validation that graph shape, roles, links, and constraints are coherent. Sentence text may be empty.

_Avoid_: lint, validate (without compile mode)

**Renderable Compile**:

Validation that a SemanticDocumentGraph can be rendered as a document. Required text must be present.

_Avoid_: publish check, final review

**Structural reader validation**:

Compile-time checking that a graph is understandable in tree reading order before prose is finalized. Combines link-existence rules, Discourse Flow, and Definition Flow during structural compile. See [Structural reader validation](docs/guide/structural-reader-validation.md).

_Avoid_: prose linting, readability score, NLP term detection

**Discourse Flow**:

The reader-facing order implied by the tree, checked against semantic links during structural compile. See [Discourse Flow validation](docs/guide/discourse-flow.md).

_Avoid_: prose style, narrative polish, readability score

**Definition Flow**:

The reader-facing availability of concepts referenced in semantic payloads, checked during structural compile. See [Definition Flow validation](docs/guide/definition-flow.md).

_Avoid_: readability score, unknown-term NLP linting, prose-style linting

**Diagnosis**:

A compiler finding with severity error, warning, or info.

_Avoid_: violation, issue (when meaning compiler output)

**PatchPlan**:

A suggested set of graph editing operations that may address diagnoses. MVP defines types and suggestions only, not execution.

_Avoid_: fix plan, rewrite plan

## Frame terms

**DocumentFrame**:

A high-level document construction model that provides default sections, paragraph patterns, sentence patterns, semantic links, and expansion rules for a document family.

_Avoid_: template (when meaning only layout), preset (when meaning schema defaults only)

**ParagraphPatternDefinition**:

A paragraph-level construction unit inside a DocumentFrame. It owns shared semantic fields and the sentence patterns that compose the paragraph.

_Avoid_: slot (when meaning the older prose-first frame slot), field group (when meaning schema-only)

**SentencePattern**:

A frame-level definition of one sentence, including role, required semantic fields, and prose requirement.

_Avoid_: sentence template (when meaning prose-only), line (when meaning rendered output)

**SemanticFill**:

Typed authoring values that fill paragraph-level semantic fields before prose is written.

_Avoid_: fill text, slot fill (when meaning finished prose)

**SemanticValue**:

A small typed value used inside SemanticFill. MVP supports text, enum, and reference kinds.

_Avoid_: string fill (when meaning final prose)

**ProseFill**:

Final sentence text keyed by paragraph id and sentence id for renderable output.

_Avoid_: draft text (when meaning semantic authoring state)

**FrameInstance**:

A JSON-serializable filled or partially filled instance of a DocumentFrame.

_Avoid_: draft, document object (when meaning rendered output)

**Deviation**:

An explicit, reasoned choice to omit a paragraph pattern from the default DocumentFrame.

_Avoid_: skip, delete (when meaning silent removal)
