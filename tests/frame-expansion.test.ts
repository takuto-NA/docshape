import { describe, expect, it } from "vitest";
import { expandFrameInstance } from "../src/frame/expand-frame.js";
import { technicalArticleExplainerFrameDefinition } from "../src/frames/technical-article-explainer.js";
import { buildLibraryUsageSemanticOnlyFrameInstance } from "./fixtures/library-usage-frame.js";

describe("expandFrameInstance", () => {
  it("expands a semantic-filled explainer frame into a graph with links", () => {
    const expansionResult = expandFrameInstance(
      technicalArticleExplainerFrameDefinition,
      buildLibraryUsageSemanticOnlyFrameInstance(),
    );

    const claimSentence = [...expansionResult.graph.root.children ?? []]
      .flatMap((section) => section.children ?? [])
      .flatMap((paragraph) => paragraph.children ?? [])
      .find((sentence) => sentence.id.includes("compileModesClaim"));

    const reasonSentence = [...expansionResult.graph.root.children ?? []]
      .flatMap((section) => section.children ?? [])
      .flatMap((paragraph) => paragraph.children ?? [])
      .find((sentence) => sentence.id.includes("reasonStructuralStatement"));

    expect(claimSentence).toBeDefined();
    expect(reasonSentence?.links.some((link) => link.type === "supports")).toBe(true);
  });
});
