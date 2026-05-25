/**
 * Demo: semantic-only graph → fillProse from semantic values → Markdown.
 * Prose is hand-authored here (no LLM). Templates mirror what an author would write from semanticPayload.
 */

import { technicalArticleExplainerFrame } from "../dist/index.js";

function proseFromProblemSemantic(semanticFill) {
  const domain = semanticFill.domain.value;
  const pain = semanticFill.pain.value;
  return `${domain.charAt(0).toUpperCase() + domain.slice(1)} often suffer from ${pain}.`;
}

function proseFromDefinitionSemantic(semanticFill) {
  return `A ${semanticFill.term.value} is ${semanticFill.meaning.value.charAt(0).toLowerCase()}${semanticFill.meaning.value.slice(1)}`;
}

function proseFromGoalSemantic(semanticFill) {
  return `A ${semanticFill.solution.value} lets authors ${semanticFill.outcome.value}.`;
}

function proseFromWorkflowBackgroundSemantic(semanticFill) {
  return `The recommended approach is ${semanticFill.approach.value}.`;
}

function proseFromWorkflowExampleSemantic(semanticFill) {
  return `Step 1: ${semanticFill.stepOne.value}. Step 2: ${semanticFill.stepTwo.value}. Step 3: ${semanticFill.stepThree.value}.`;
}

function proseFromSummarySemantic(semanticFill) {
  return `In short: start with a ${semanticFill.takeaway.value}.`;
}

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
      value: "define the graph with document, section, paragraph, and sentence nodes",
    },
    stepTwo: {
      kind: "text",
      value: "run compileStructural, then fill prose, then compileRenderable",
    },
    stepThree: {
      kind: "text",
      value: "call renderMarkdown to produce the article body",
    },
  })
  .fillSemantic("summarySummary", {
    takeaway: {
      kind: "text",
      value: "typed graph, two compile passes, and tree-order Markdown rendering",
    },
  })
  .deviate("summaryLimitations", "Demo omits limitations.");

console.log("=== 1. semantic-only: renderMarkdown ===");
console.log("(headings only — sentence text is still empty)\n");
console.log(article.renderMarkdown() || "(empty)");
console.log(`\ncompileStructural: ${article.compileStructural().isValid}`);
console.log(`compileRenderable: ${article.compileRenderable().isValid}`);

console.log("\n=== 2. semantic から prose を作成（fillProse） ===\n");

const semanticFills = article.toFrameInstance().semanticFills;

article = article
  .fillProse("introductionProblem", {
    problemStatement: proseFromProblemSemantic(semanticFills.introductionProblem),
  })
  .fillProse("introductionGraphDefinition", {
    definitionStatement: proseFromDefinitionSemantic(
      article.toFrameInstance().semanticFills.introductionGraphDefinition ?? {
        term: { kind: "text", value: "SemanticDocumentGraph" },
        meaning: {
          kind: "text",
          value:
            "A typed graph of sections, paragraphs, sentences, and semantic links used as compiler intermediate representation.",
        },
      },
    ),
  })
  .fillProse("introductionGoal", {
    goalStatement: proseFromGoalSemantic(semanticFills.introductionGoal),
  })
  .fillProse("workflowBackground", {
    workflowStatement: proseFromWorkflowBackgroundSemantic(semanticFills.workflowBackground),
  })
  .fillProse("workflowConstraint", {
    constraintStatement:
      "Structural compile accepts empty sentence text when roles and links are valid.",
  })
  .fillProse("workflowDesignDecision", {
    designDecisionStatement: "Build the graph before writing full prose.",
  })
  .fillProse("workflowExample", {
    exampleStepOne: `Step 1: ${semanticFills.workflowExample.stepOne.value}.`,
    exampleStepTwo: `Step 2: ${semanticFills.workflowExample.stepTwo.value}.`,
    exampleStepThree: `Step 3: ${semanticFills.workflowExample.stepThree.value}.`,
  })
  .fillProse("compileModesReasonStructural", {
    reasonStructuralStatement:
      "compileStructural checks ids, nesting, roles, links, and schema constraints while text may still be empty.",
  })
  .fillProse("compileModesReasonRenderable", {
    reasonRenderableStatement:
      "compileRenderable adds required-text checks so the graph can be output as Markdown.",
  })
  .fillProse("compileModesClaim", {
    claimStatement: "Two compile modes separate structure validation from render readiness.",
  })
  .fillProse("summarySummary", {
    summaryStatement: proseFromSummarySemantic(semanticFills.summarySummary),
  });

console.log("Introduction / problem (semantic → prose):");
console.log(`  semantic: domain="${semanticFills.introductionProblem.domain.value}"`);
console.log(`  prose:    "${article.toFrameInstance().proseFills.introductionProblem.problemStatement}"`);

console.log("\n=== 3. prose 追加後: renderMarkdown ===\n");
console.log(article.renderMarkdown());

console.log("\n=== compile ===");
console.log(`compileStructural: ${article.compileStructural().isValid}`);
console.log(`compileRenderable: ${article.compileRenderable().isValid}`);
