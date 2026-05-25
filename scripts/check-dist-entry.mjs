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

const frameAuthor = technicalArticleExplainerFrame("Dist smoke check")
  .fill({
    problem: "Problem text.",
    goal: "Goal text.",
    workflow: "Workflow text.",
    example: "Example text.",
    summary: "Summary text.",
  })
  .deviate("limitations", "Dist smoke check omits limitations.");

const frameCompileResult = frameAuthor.compileRenderable();
const frameExpansionResult = expandFrameInstance(frameDefinition, frameAuthor.toFrameInstance());

if (!frameCompileResult.isValid) {
  throw new Error("Built dist frame entrypoint failed the smoke check.");
}

if (frameExpansionResult.graph.root.children?.length === 0) {
  throw new Error("Built dist frame expansion failed the smoke check.");
}

console.log("dist entrypoint smoke check passed");
