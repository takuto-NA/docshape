/**
 * Shared frame instance for library usage article tests.
 */

import type { FrameInstance } from "../../src/types/frame.js";

export function buildLibraryUsageSemanticFills(): FrameInstance["semanticFills"] {
  return {
    introductionProblem: {
      domain: { kind: "text", value: "technical articles written directly as prose" },
      pain: {
        kind: "text",
        value: "missing support, unclear roles, or broken structure",
      },
    },
    introductionGoal: {
      solution: { kind: "text", value: "SemanticDocumentGraph" },
      outcome: { kind: "text", value: "validate obligations before rendering Markdown" },
    },
    workflowBackground: {
      approach: {
        kind: "text",
        value: "bottom-up graph construction with semantic links",
      },
    },
    workflowExample: {
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
    },
    summarySummary: {
      takeaway: {
        kind: "text",
        value: "typed graph, two compile passes, tree-order Markdown rendering",
      },
    },
  };
}

export function buildLibraryUsageProseFills(): FrameInstance["proseFills"] {
  return {
    introductionProblem: {
      problemStatement:
        "Technical articles written directly as prose are hard to validate for missing support, unclear roles, or broken structure.",
    },
    introductionGoal: {
      goalStatement:
        "Docshape lets authors define a SemanticDocumentGraph first, validate obligations, then render Markdown.",
    },
    introductionGraphDefinition: {
      definitionStatement:
        "A SemanticDocumentGraph is a typed graph of sections, paragraphs, sentences, and semantic links used as compiler intermediate representation.",
    },
    workflowBackground: {
      workflowStatement:
        "The recommended flow is bottom-up: define the tree, attach semantic links, compile structurally, fill sentence text, then compile for rendering.",
    },
    workflowDesignDecision: {
      designDecisionStatement: "Build the graph before writing full prose.",
    },
    workflowConstraint: {
      constraintStatement:
        "Structural compile accepts empty sentence text when roles and links are valid.",
    },
    workflowExample: {
      exampleStepOne:
        "Step 1: call defineSemanticDocumentGraph with document, section, paragraph, and sentence nodes.",
      exampleStepTwo: "Step 2: run compileStructural, fill text, then run compileRenderable.",
      exampleStepThree: "Step 3: call renderMarkdown to produce the article body.",
    },
    compileModesClaim: {
      claimStatement:
        "Two compile modes separate structure validation from render readiness.",
    },
    compileModesReasonStructural: {
      reasonStructuralStatement:
        "compileStructural checks ids, nesting, roles, links, and schema constraints while text may still be empty.",
    },
    compileModesReasonRenderable: {
      reasonRenderableStatement:
        "compileRenderable adds required-text checks so the graph can be output as Markdown.",
    },
    summarySummary: {
      summaryStatement:
        "Docshape usage starts with a typed graph, validates it twice, then renders Markdown in tree order.",
    },
  };
}

export function buildLibraryUsageFrameInstance(): FrameInstance {
  return {
    frameId: "technical_article.explainer",
    title: "How to use docshape",
    semanticFills: buildLibraryUsageSemanticFills(),
    proseFills: buildLibraryUsageProseFills(),
    deviations: [
      {
        paragraphId: "summaryLimitations",
        reason: "This short article does not need a separate limitations section.",
      },
    ],
  };
}

export function buildLibraryUsageSemanticOnlyFrameInstance(): FrameInstance {
  return {
    frameId: "technical_article.explainer",
    title: "How to use docshape",
    semanticFills: buildLibraryUsageSemanticFills(),
    proseFills: {},
    deviations: [
      {
        paragraphId: "summaryLimitations",
        reason: "This short article does not need a separate limitations section.",
      },
    ],
  };
}
