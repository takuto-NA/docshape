import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { technicalArticleExplainerFrame } from "../src/frames/technical-article-explainer-fluent.js";

describe("library usage frame target", () => {
  it("expresses the article in 50 lines or fewer at the example source level", () => {
    const exampleSource = readFileSync("examples/library-usage-frame.mjs", "utf8");
    const nonEmptyLines = exampleSource
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("//") && !line.startsWith("*"));

    expect(nonEmptyLines.length).toBeLessThanOrEqual(50);
  });

  it("passes structural and renderable compile for the high-level example", () => {
    const author = technicalArticleExplainerFrame("How to use docshape").fill({
      problem:
        "Technical articles written directly as prose are hard to validate for missing support, unclear roles, or broken structure.",
      goal: "Docshape lets authors define a SemanticDocumentGraph first, validate obligations, then render Markdown.",
      workflow:
        "The recommended flow is bottom-up: define the tree, attach semantic links, compile structurally, fill sentence text, then compile for rendering.",
      example: [
        "Step 1: call defineSemanticDocumentGraph with document, section, paragraph, and sentence nodes.",
        "Step 2: run compileStructural, fill text, then run compileRenderable.",
        "Step 3: call renderMarkdown to produce the article body.",
      ].join("\n"),
      summary:
        "Docshape usage starts with a typed graph, validates it twice, then renders Markdown in tree order.",
    }).deviate(
      "limitations",
      "This short article does not need a separate limitations section.",
    );

    expect(author.compileStructural().isValid).toBe(true);
    expect(author.compileRenderable().isValid).toBe(true);
    expect(author.renderMarkdown()).toContain("# Introduction");
  });
});
