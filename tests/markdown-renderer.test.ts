import { describe, expect, it } from "vitest";
import { renderMarkdown } from "../src/index.js";
import { treeOrderMarkdownGraph } from "./fixtures/sample-graphs.js";

describe("renderMarkdown", () => {
  it("preserves tree order and ignores semantic link order", () => {
    const renderedMarkdown = renderMarkdown(treeOrderMarkdownGraph);

    expect(renderedMarkdown.indexOf("Background sentence appears first.")).toBeLessThan(
      renderedMarkdown.indexOf("Method sentence appears second."),
    );
    expect(renderedMarkdown).toContain("# Background");
    expect(renderedMarkdown).toContain("# Method");
  });
});
