import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { technicalArticleExplainerFrame } from "../src/frames/technical-article-explainer-fluent.js";
import {
  buildLibraryUsageProseFills,
  buildLibraryUsageSemanticFills,
} from "./fixtures/library-usage-frame.js";

describe("library usage frame target", () => {
  it("demonstrates semantic fill before prose fill in the example source", () => {
    const exampleSource = readFileSync("examples/library-usage-frame.mjs", "utf8");

    expect(exampleSource).toContain("fillSemantic");
    expect(exampleSource).toContain("fillProse");
    expect(exampleSource.indexOf("compileStructural")).toBeLessThan(
      exampleSource.indexOf("compileRenderable"),
    );
  });

  it("passes structural compile before prose and renderable compile after prose", () => {
    let author = technicalArticleExplainerFrame("How to use docshape");

    for (const [paragraphId, semanticFill] of Object.entries(buildLibraryUsageSemanticFills())) {
      author = author.fillSemantic(paragraphId, semanticFill);
    }

    expect(author.compileStructural().isValid).toBe(true);
    expect(author.compileRenderable().isValid).toBe(false);

    for (const [paragraphId, proseFill] of Object.entries(buildLibraryUsageProseFills())) {
      author = author.fillProse(paragraphId, proseFill);
    }

    author = author.deviate(
      "summaryLimitations",
      "This short article does not need a separate limitations section.",
    );

    expect(author.compileRenderable().isValid).toBe(true);
    expect(author.renderMarkdown()).toContain("# Introduction");
  });
});
