/**
 * High-level DocumentFrame example for the library usage article theme.
 */

import { technicalArticleExplainerFrame } from "../dist/index.js";

const article = technicalArticleExplainerFrame("How to use docshape")
  .fill({
    problem:
      "Technical articles written directly as prose are hard to validate for missing support, unclear roles, or broken structure.",
    goal: "Docshape lets authors define a SemanticDocumentGraph first, validate obligations, then render Markdown.",
    workflow:
      "The recommended flow is bottom-up: define the tree, attach semantic links, compile structurally, fill sentence text, then compile for rendering.",
    example: [
      "Step 1: call defineSemanticDocumentGraph with document, section, paragraph, and sentence nodes.",
      "Step 2: run compileStructural, fill text, then run compileRenderable.",
      "Step 3: call renderMarkdown to produce the article body.",
    ].join("\n"),
    summary:
      "Docshape usage starts with a typed graph, validates it twice, then renders Markdown in tree order.",
  })
  .deviate("limitations", "This short article does not need a separate limitations section.");

const structuralResult = article.compileStructural();
const renderableResult = article.compileRenderable();
const markdown = article.renderMarkdown();

console.log("=== compileStructural ===");
console.log(`isValid: ${structuralResult.isValid}`);

console.log("\n=== compileRenderable ===");
console.log(`isValid: ${renderableResult.isValid}`);

console.log("\n=== renderMarkdown ===\n");
console.log(markdown);
