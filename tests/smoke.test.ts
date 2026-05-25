import { describe, expect, it } from "vitest";
import {
  compileStructural,
  defineSemanticDocumentGraph,
  expandFrameInstance,
  getFrameById,
  technicalArticleExplainerFrame,
  technicalArticleSchema,
} from "../src/index.js";

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

    const author = technicalArticleExplainerFrame("Smoke test")
      .fill({
        problem: "Problem text.",
        goal: "Goal text.",
        workflow: "Workflow text.",
        example: "Example text.",
        summary: "Summary text.",
      })
      .deviate("limitations", "Smoke test omits limitations.");

    expect(author.compileRenderable().isValid).toBe(true);
    expect(
      expandFrameInstance(frameDefinition!, author.toFrameInstance()).graph.root.children?.length,
    ).toBeGreaterThan(0);
  });
});
