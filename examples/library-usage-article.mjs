/**
 * Builds a SemanticDocumentGraph for the article theme "How to use docshape".
 */

import {
  compileRenderable,
  compileStructural,
  createSemanticDocumentNode,
  defineSemanticDocumentGraph,
  renderMarkdown,
  technicalArticleSchema,
} from "../dist/index.js";

export function buildLibraryUsageArticleGraph() {
  return defineSemanticDocumentGraph(
    createSemanticDocumentNode({
      id: "document-library-usage",
      layer: "document",
      role: "document",
      text: "",
      links: [],
      children: [
        createSemanticDocumentNode({
          id: "section-introduction",
          layer: "section",
          role: "background",
          text: "Introduction",
          links: [],
          children: [
            createSemanticDocumentNode({
              id: "paragraph-problem",
              layer: "paragraph",
              role: "problem",
              text: "",
              links: [],
              children: [
                createSemanticDocumentNode({
                  id: "sentence-problem",
                  layer: "sentence",
                  role: "problem",
                  text: "Technical articles written directly as prose are hard to validate for missing support, unclear roles, or broken structure.",
                  links: [],
                }),
              ],
            }),
            createSemanticDocumentNode({
              id: "paragraph-graph-definition",
              layer: "paragraph",
              role: "definition",
              text: "",
              links: [],
              children: [
                createSemanticDocumentNode({
                  id: "sentence-graph-definition",
                  layer: "sentence",
                  role: "definition",
                  text: "A SemanticDocumentGraph is a typed graph of sections, paragraphs, sentences, and semantic links used as compiler intermediate representation.",
                  links: [],
                }),
              ],
            }),
            createSemanticDocumentNode({
              id: "paragraph-goal",
              layer: "paragraph",
              role: "goal",
              text: "",
              links: [],
              children: [
                createSemanticDocumentNode({
                  id: "sentence-goal",
                  layer: "sentence",
                  role: "goal",
                  text: "Docshape lets authors define a SemanticDocumentGraph first, validate obligations, then render Markdown.",
                  links: [],
                  semanticPayload: {
                    solutionConcept: {
                      kind: "reference",
                      value: "sentence-graph-definition",
                    },
                  },
                }),
              ],
            }),
          ],
        }),
        createSemanticDocumentNode({
          id: "section-workflow",
          layer: "section",
          role: "background",
          text: "Workflow",
          links: [],
          children: [
            createSemanticDocumentNode({
              id: "paragraph-workflow-overview",
              layer: "paragraph",
              role: "background",
              text: "",
              links: [],
              children: [
                createSemanticDocumentNode({
                  id: "sentence-workflow-overview",
                  layer: "sentence",
                  role: "background",
                  text: "The recommended flow is bottom-up: define the tree, attach semantic links, compile structurally, fill sentence text, then compile for rendering.",
                  links: [],
                }),
              ],
            }),
            createSemanticDocumentNode({
              id: "paragraph-constraint",
              layer: "paragraph",
              role: "constraint",
              text: "",
              links: [],
              children: [
                createSemanticDocumentNode({
                  id: "sentence-constraint-empty-text",
                  layer: "sentence",
                  role: "constraint",
                  text: "Structural compile accepts empty sentence text when roles and links are valid.",
                  links: [],
                }),
              ],
            }),
            createSemanticDocumentNode({
              id: "paragraph-design-decision",
              layer: "paragraph",
              role: "design_decision",
              text: "",
              links: [],
              children: [
                createSemanticDocumentNode({
                  id: "sentence-design-decision",
                  layer: "sentence",
                  role: "design_decision",
                  text: "Build the graph before writing full prose.",
                  links: [
                    {
                      type: "depends_on",
                      targetId: "sentence-constraint-empty-text",
                    },
                  ],
                }),
              ],
            }),
            createSemanticDocumentNode({
              id: "paragraph-workflow-steps",
              layer: "paragraph",
              role: "example",
              text: "",
              links: [],
              children: [
                createSemanticDocumentNode({
                  id: "sentence-step-define",
                  layer: "sentence",
                  role: "example",
                  text: "Step 1: call defineSemanticDocumentGraph with document, section, paragraph, and sentence nodes.",
                  links: [],
                }),
                createSemanticDocumentNode({
                  id: "sentence-step-compile",
                  layer: "sentence",
                  role: "example",
                  text: "Step 2: run compileStructural, fill text, then run compileRenderable.",
                  links: [],
                }),
                createSemanticDocumentNode({
                  id: "sentence-step-render",
                  layer: "sentence",
                  role: "example",
                  text: "Step 3: call renderMarkdown to produce the article body.",
                  links: [],
                }),
              ],
            }),
          ],
        }),
        createSemanticDocumentNode({
          id: "section-compile-modes",
          layer: "section",
          role: "background",
          text: "Compile modes",
          links: [],
          children: [
            createSemanticDocumentNode({
              id: "paragraph-reason-structural",
              layer: "paragraph",
              role: "reason",
              text: "",
              links: [],
              children: [
                createSemanticDocumentNode({
                  id: "sentence-reason-structural",
                  layer: "sentence",
                  role: "reason",
                  text: "compileStructural checks ids, nesting, roles, links, and schema constraints while text may still be empty.",
                  links: [{ type: "supports", targetId: "sentence-claim" }],
                }),
              ],
            }),
            createSemanticDocumentNode({
              id: "paragraph-reason-renderable",
              layer: "paragraph",
              role: "reason",
              text: "",
              links: [],
              children: [
                createSemanticDocumentNode({
                  id: "sentence-reason-renderable",
                  layer: "sentence",
                  role: "reason",
                  text: "compileRenderable adds required-text checks so the graph can be output as Markdown.",
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
                  text: "Two compile modes separate structure validation from render readiness.",
                  links: [],
                }),
              ],
            }),
          ],
        }),
        createSemanticDocumentNode({
          id: "section-summary",
          layer: "section",
          role: "summary",
          text: "Summary",
          links: [],
          children: [
            createSemanticDocumentNode({
              id: "paragraph-summary",
              layer: "paragraph",
              role: "summary",
              text: "",
              links: [],
              children: [
                createSemanticDocumentNode({
                  id: "sentence-summary",
                  layer: "sentence",
                  role: "summary",
                  text: "Docshape usage starts with a typed graph, validates it twice, then renders Markdown in tree order.",
                  links: [
                    { type: "summarizes", targetId: "section-workflow" },
                    { type: "summarizes", targetId: "section-compile-modes" },
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  );
}

const graph = buildLibraryUsageArticleGraph();
const structuralResult = compileStructural(graph, technicalArticleSchema);
const renderableResult = compileRenderable(graph, technicalArticleSchema);
const markdown = renderMarkdown(graph);

console.log("=== compileStructural ===");
console.log(`isValid: ${structuralResult.isValid}`);
console.log(`diagnoses: ${structuralResult.diagnoses.length}`);

console.log("\n=== compileRenderable ===");
console.log(`isValid: ${renderableResult.isValid}`);
console.log(`diagnoses: ${renderableResult.diagnoses.length}`);

console.log("\n=== renderMarkdown ===\n");
console.log(markdown);
