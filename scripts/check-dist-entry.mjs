/**
 * Smoke-checks the built package entrypoint after `npm run build`.
 */

import {
  compileStructural,
  defineSemanticDocumentGraph,
  expandFrameInstance,
  getFrameById,
  technicalArticleExplainerFrame,
  technicalArticleSchema,
} from "../dist/index.js";

const graph = defineSemanticDocumentGraph({
  id: "document-root",
  layer: "document",
  role: "document",
  text: "",
  links: [],
  children: [],
});

const graphCompileResult = compileStructural(graph, technicalArticleSchema);

if (!graphCompileResult.isValid) {
  throw new Error("Built dist graph entrypoint failed the smoke check.");
}

const frameDefinition = getFrameById("technical_article.explainer");

if (frameDefinition === undefined) {
  throw new Error("Built dist frame registry failed the smoke check.");
}

let frameAuthor = technicalArticleExplainerFrame("Dist smoke check")
  .fillSemantic("introductionProblem", {
    domain: { kind: "text", value: "technical articles" },
    pain: { kind: "text", value: "validation gaps" },
  })
  .fillSemantic("introductionGoal", {
    solution: { kind: "text", value: "docshape" },
    outcome: { kind: "text", value: "typed validation" },
  })
  .fillSemantic("workflowBackground", {
    approach: { kind: "text", value: "bottom-up graph construction" },
  })
  .fillSemantic("workflowExample", {
    stepOne: { kind: "text", value: "define graph" },
    stepTwo: { kind: "text", value: "compile structurally" },
    stepThree: { kind: "text", value: "render markdown" },
  })
  .fillSemantic("summarySummary", {
    takeaway: { kind: "text", value: "semantic-first authoring" },
  })
  .deviate("summaryLimitations", "Dist smoke check omits limitations.");

const structuralResult = frameAuthor.compileStructural();

if (!structuralResult.isValid) {
  throw new Error("Built dist semantic frame structural compile failed the smoke check.");
}

frameAuthor = frameAuthor
  .fillProse("introductionProblem", {
    problemStatement: "Problem text.",
  })
  .fillProse("introductionGoal", {
    goalStatement: "Goal text.",
  })
  .fillProse("workflowBackground", {
    workflowStatement: "Workflow text.",
  })
  .fillProse("workflowDesignDecision", {
    designDecisionStatement: "Build the graph before writing full prose.",
  })
  .fillProse("workflowConstraint", {
    constraintStatement: "Structural compile accepts empty sentence text when roles and links are valid.",
  })
  .fillProse("workflowExample", {
    exampleStepOne: "Example step one.",
    exampleStepTwo: "Example step two.",
    exampleStepThree: "Example step three.",
  })
  .fillProse("compileModesClaim", {
    claimStatement: "Two compile modes separate structure validation from render readiness.",
  })
  .fillProse("compileModesReasonStructural", {
    reasonStructuralStatement: "compileStructural checks ids, nesting, roles, links, and schema constraints while text may still be empty.",
  })
  .fillProse("compileModesReasonRenderable", {
    reasonRenderableStatement: "compileRenderable adds required-text checks so the graph can be output as Markdown.",
  })
  .fillProse("summarySummary", {
    summaryStatement: "Summary text.",
  });

const frameCompileResult = frameAuthor.compileRenderable();
const frameExpansionResult = expandFrameInstance(frameDefinition, frameAuthor.toFrameInstance());

if (!frameCompileResult.isValid) {
  throw new Error("Built dist frame entrypoint failed the smoke check.");
}

if (frameExpansionResult.graph.root.children?.length === 0) {
  throw new Error("Built dist frame expansion failed the smoke check.");
}

console.log("dist entrypoint smoke check passed");
