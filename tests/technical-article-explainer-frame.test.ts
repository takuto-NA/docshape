import { describe, expect, it } from "vitest";
import {
  compileFrameInstanceRenderable,
  compileFrameInstanceStructural,
  renderFrameInstanceMarkdown,
} from "../src/frame/frame-helpers.js";
import { technicalArticleExplainerFrameDefinition } from "../src/frames/technical-article-explainer.js";
import { buildLibraryUsageFrameInstance } from "./fixtures/library-usage-frame.js";

describe("technical_article.explainer frame", () => {
  it("passes structural and renderable compile when required semantic and prose fills are provided", () => {
    const instance = buildLibraryUsageFrameInstance();
    const structuralResult = compileFrameInstanceStructural(
      technicalArticleExplainerFrameDefinition,
      instance,
    );
    const renderableResult = compileFrameInstanceRenderable(
      technicalArticleExplainerFrameDefinition,
      instance,
    );

    expect(structuralResult.isValid).toBe(true);
    expect(renderableResult.isValid).toBe(true);
  });

  it("renders markdown in tree order", () => {
    const markdown = renderFrameInstanceMarkdown(
      technicalArticleExplainerFrameDefinition,
      buildLibraryUsageFrameInstance(),
    );

    expect(markdown.indexOf("Introduction")).toBeLessThan(markdown.indexOf("Workflow"));
    expect(markdown.indexOf("Workflow")).toBeLessThan(markdown.indexOf("Compile modes"));
    expect(markdown.indexOf("Compile modes")).toBeLessThan(markdown.indexOf("Summary"));
  });
});
