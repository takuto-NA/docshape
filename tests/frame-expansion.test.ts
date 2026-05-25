import { describe, expect, it } from "vitest";
import { expandFrameInstance } from "../src/frame/expand-frame.js";
import { technicalArticleExplainerFrameDefinition } from "../src/frames/technical-article-explainer.js";
import { buildLibraryUsageFrameInstance } from "./fixtures/library-usage-frame.js";

describe("expandFrameInstance", () => {
  it("expands a filled explainer frame into a semantic graph with links", () => {
    const expansionResult = expandFrameInstance(
      technicalArticleExplainerFrameDefinition,
      buildLibraryUsageFrameInstance(),
    );

    const claimNode = [...expansionResult.graph.root.children ?? []]
      .flatMap((section) => section.children ?? [])
      .flatMap((paragraph) => paragraph.children ?? [])
      .find((sentence) => sentence.role === "claim");

    const reasonNode = [...expansionResult.graph.root.children ?? []]
      .flatMap((section) => section.children ?? [])
      .flatMap((paragraph) => paragraph.children ?? [])
      .find((sentence) => sentence.id.includes("reasonStructural"));

    expect(claimNode).toBeDefined();
    expect(reasonNode?.links.some((link) => link.type === "supports")).toBe(true);
  });
});
