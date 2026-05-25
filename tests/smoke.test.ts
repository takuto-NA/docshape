import { describe, expect, it } from "vitest";
import {
  compileStructural,
  defineSemanticDocumentGraph,
  expandFrameInstance,
  getFrameById,
  technicalArticleExplainerFrame,
  technicalArticleSchema,
} from "../src/index.js";
import {
  buildLibraryUsageProseFills,
  buildLibraryUsageSemanticFills,
} from "./fixtures/library-usage-frame.js";

describe("package smoke test", () => {
  it("imports the public graph core API", () => {
    const graph = defineSemanticDocumentGraph({
      id: "document-root",
      layer: "document",
      role: "document",
      text: "",
      links: [],
      children: [],
    });

    const compileResult = compileStructural(graph, technicalArticleSchema);

    expect(compileResult.isValid).toBe(true);
  });

  it("imports the public DocumentFrame API", () => {
    const frameDefinition = getFrameById("technical_article.explainer");

    expect(frameDefinition).toBeDefined();

    let author = technicalArticleExplainerFrame("Smoke test");

    for (const [paragraphId, semanticFill] of Object.entries(buildLibraryUsageSemanticFills())) {
      author = author.fillSemantic(paragraphId, semanticFill);
    }

    for (const [paragraphId, proseFill] of Object.entries(buildLibraryUsageProseFills())) {
      author = author.fillProse(paragraphId, proseFill);
    }

    author = author.deviate("summaryLimitations", "Smoke test omits limitations.");

    expect(author.compileRenderable().isValid).toBe(true);
    expect(
      expandFrameInstance(frameDefinition!, author.toFrameInstance()).graph.root.children?.length,
    ).toBeGreaterThan(0);
  });
});
