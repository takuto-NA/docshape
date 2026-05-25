# Complete workflow example

This example builds a minimal technical article graph with a supported claim and renders it to Markdown.

```typescript
import {
  compileRenderable,
  compileStructural,
  createSemanticDocumentNode,
  defineSemanticDocumentGraph,
  renderMarkdown,
  technicalArticleSchema,
} from "docshape";

const graph = defineSemanticDocumentGraph(
  createSemanticDocumentNode({
    id: "document-root",
    layer: "document",
    role: "document",
    text: "",
    links: [],
    children: [
      createSemanticDocumentNode({
        id: "section-intro",
        layer: "section",
        role: "background",
        text: "Introduction",
        links: [],
        children: [
          createSemanticDocumentNode({
            id: "paragraph-reason",
            layer: "paragraph",
            role: "reason",
            text: "",
            links: [],
            children: [
              createSemanticDocumentNode({
                id: "sentence-reason",
                layer: "sentence",
                role: "reason",
                text: "Roles and links can be validated before all prose is written.",
                links: [{ type: "supports", targetId: "sentence-claim" }],
              }),
            ],
          }),
          createSemanticDocumentNode({
            id: "paragraph-claim",
            layer: "paragraph",
            role: "claim",
            text: "",
            links: [],
            children: [
              createSemanticDocumentNode({
                id: "sentence-claim",
                layer: "sentence",
                role: "claim",
                text: "Structure-first authoring keeps obligations explicit.",
                links: [],
              }),
            ],
          }),
        ],
      }),
    ],
  }),
);

const structuralResult = compileStructural(graph, technicalArticleSchema);
const renderableResult = compileRenderable(graph, technicalArticleSchema);
const markdown = renderMarkdown(graph);
```

After this graph is built, `structuralResult.isValid` and `renderableResult.isValid` are both `true`. The same graph with empty sentence text passes structural compile and fails renderable compile.

Return to the [library guide](../guide.md).
