/**
 * Smoke-checks the built package entrypoint after `npm run build`.
 */

import {
  compileStructural,
  defineSemanticDocumentGraph,
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

const compileResult = compileStructural(graph, technicalArticleSchema);

if (!compileResult.isValid) {
  throw new Error("Built dist entrypoint failed the smoke check.");
}

console.log("dist entrypoint smoke check passed");
