import { describe, expect, it } from "vitest";
import { buildReadingSpanLookup } from "../src/schema/discourse-flow.js";
import { FRAME_DIAGNOSTIC_CODES } from "../src/constants/frame-diagnostic-codes.js";
import {
  compileFrameInstanceRenderable,
  compileFrameInstanceStructural,
} from "../src/frame/frame-helpers.js";
import { expandFrameInstance } from "../src/frame/expand-frame.js";
import { technicalArticleExplainerFrameDefinition } from "../src/frames/technical-article-explainer.js";
import { technicalArticleExplainerFrame } from "../src/frames/technical-article-explainer-fluent.js";
import {
  buildLibraryUsageFrameInstance,
  buildLibraryUsageSemanticOnlyFrameInstance,
} from "./fixtures/library-usage-frame.js";

describe("semantic-first sentence patterns", () => {
  it("structurally compiles with semantic fills and empty prose", () => {
    const compileResult = compileFrameInstanceStructural(
      technicalArticleExplainerFrameDefinition,
      buildLibraryUsageSemanticOnlyFrameInstance(),
    );

    expect(compileResult.isValid).toBe(true);
  });

  it("fails renderable compile when required sentence prose is missing", () => {
    const compileResult = compileFrameInstanceRenderable(
      technicalArticleExplainerFrameDefinition,
      buildLibraryUsageSemanticOnlyFrameInstance(),
    );

    expect(compileResult.isValid).toBe(false);
    expect(compileResult.diagnoses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: FRAME_DIAGNOSTIC_CODES.missingRequiredSentenceProse,
          severity: "error",
        }),
      ]),
    );
  });

  it("fails structural compile when required semantic fields are missing", () => {
    const compileResult = compileFrameInstanceStructural(
      technicalArticleExplainerFrameDefinition,
      {
        frameId: "technical_article.explainer",
        title: "Incomplete article",
        semanticFills: {},
        proseFills: {},
      },
    );

    expect(compileResult.isValid).toBe(false);
    expect(compileResult.diagnoses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: FRAME_DIAGNOSTIC_CODES.missingRequiredSemanticField,
          severity: "error",
          nodeId: "introductionProblem.domain",
        }),
      ]),
    );
  });

  it("preserves semantic payload on expanded sentence nodes", () => {
    const expansionResult = expandFrameInstance(
      technicalArticleExplainerFrameDefinition,
      buildLibraryUsageSemanticOnlyFrameInstance(),
    );

    const problemSentence = [...expansionResult.graph.root.children ?? []]
      .flatMap((section) => section.children ?? [])
      .flatMap((paragraph) => paragraph.children ?? [])
      .find((sentence) => sentence.role === "problem");

    expect(problemSentence?.semanticPayload).toEqual({
      domain: {
        kind: "text",
        value: "technical articles written directly as prose",
      },
      pain: {
        kind: "text",
        value: "missing support, unclear roles, or broken structure",
      },
    });
    expect(problemSentence?.text).toBe("");
  });

  it("resolves explicit paragraph and sentence link templates", () => {
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
    expect(reasonSentence?.links[0]?.targetId).toBe(claimSentence?.id);

    const readingSpanLookup = buildReadingSpanLookup(expansionResult.graph);
    const reasonReadingSpan = readingSpanLookup.get(reasonSentence?.id ?? "");
    const claimReadingSpan = readingSpanLookup.get(claimSentence?.id ?? "");

    expect(reasonReadingSpan).toBeDefined();
    expect(claimReadingSpan).toBeDefined();
    expect(reasonReadingSpan?.end).toBeLessThan(claimReadingSpan?.start ?? Number.MAX_SAFE_INTEGER);
  });

  it("exposes fillSemantic and fillProse instead of fill", () => {
    const author = technicalArticleExplainerFrame("Semantic API check");

    expect(typeof author.fillSemantic).toBe("function");
    expect(typeof author.fillProse).toBe("function");
    expect("fill" in author).toBe(false);
  });

  it("passes renderable compile after prose fills are provided", () => {
    const compileResult = compileFrameInstanceRenderable(
      technicalArticleExplainerFrameDefinition,
      buildLibraryUsageFrameInstance(),
    );

    expect(compileResult.isValid).toBe(true);
  });
});
