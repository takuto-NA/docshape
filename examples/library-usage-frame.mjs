/**
 * High-level DocumentFrame example for the library usage article theme.
 */

import { technicalArticleExplainerFrame } from "../dist/index.js";

let article = technicalArticleExplainerFrame("How to use docshape")
  .fillSemantic("introductionProblem", {
    domain: { kind: "text", value: "technical articles written directly as prose" },
    pain: {
      kind: "text",
      value: "missing support, unclear roles, or broken structure",
    },
  })
  .fillSemantic("introductionGoal", {
    solution: { kind: "text", value: "SemanticDocumentGraph" },
    outcome: { kind: "text", value: "validate obligations before rendering Markdown" },
  })
  .fillSemantic("workflowBackground", {
    approach: {
      kind: "text",
      value: "bottom-up graph construction with semantic links",
    },
  })
  .fillSemantic("workflowExample", {
    stepOne: {
      kind: "text",
      value: "defineSemanticDocumentGraph with document, section, paragraph, and sentence nodes",
    },
    stepTwo: {
      kind: "text",
      value: "run compileStructural, fill text, then run compileRenderable",
    },
    stepThree: {
      kind: "text",
      value: "call renderMarkdown to produce the article body",
    },
  })
  .fillSemantic("summarySummary", {
    takeaway: {
      kind: "text",
      value: "typed graph, two compile passes, tree-order Markdown rendering",
    },
  })
  .deviate("summaryLimitations", "This short article does not need a separate limitations section.");

const structuralResult = article.compileStructural();
console.log("=== compileStructural ===");
console.log(`isValid: ${structuralResult.isValid}`);

article = article
  .fillProse("introductionProblem", {
    problemStatement:
      "Technical articles written directly as prose are hard to validate for missing support, unclear roles, or broken structure.",
  })
  .fillProse("introductionGoal", {
    goalStatement:
      "Docshape lets authors define a SemanticDocumentGraph first, validate obligations, then render Markdown.",
  })
  .fillProse("workflowBackground", {
    workflowStatement:
      "The recommended flow is bottom-up: define the tree, attach semantic links, compile structurally, fill sentence text, then compile for rendering.",
  })
  .fillProse("workflowDesignDecision", {
    designDecisionStatement: "Build the graph before writing full prose.",
  })
  .fillProse("workflowConstraint", {
    constraintStatement:
      "Structural compile accepts empty sentence text when roles and links are valid.",
  })
  .fillProse("workflowExample", {
    exampleStepOne:
      "Step 1: call defineSemanticDocumentGraph with document, section, paragraph, and sentence nodes.",
    exampleStepTwo: "Step 2: run compileStructural, fill text, then run compileRenderable.",
    exampleStepThree: "Step 3: call renderMarkdown to produce the article body.",
  })
  .fillProse("compileModesClaim", {
    claimStatement: "Two compile modes separate structure validation from render readiness.",
  })
  .fillProse("compileModesReasonStructural", {
    reasonStructuralStatement:
      "compileStructural checks ids, nesting, roles, links, and schema constraints while text may still be empty.",
  })
  .fillProse("compileModesReasonRenderable", {
    reasonRenderableStatement:
      "compileRenderable adds required-text checks so the graph can be output as Markdown.",
  })
  .fillProse("summarySummary", {
    summaryStatement:
      "Docshape usage starts with a typed graph, validates it twice, then renders Markdown in tree order.",
  });

const renderableResult = article.compileRenderable();
const markdown = article.renderMarkdown();

console.log("\n=== compileRenderable ===");
console.log(`isValid: ${renderableResult.isValid}`);

console.log("\n=== renderMarkdown ===\n");
console.log(markdown);
