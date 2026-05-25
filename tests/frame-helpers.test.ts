import { describe, expect, it } from "vitest";
import { FRAME_DIAGNOSTIC_CODES } from "../src/constants/frame-diagnostic-codes.js";
import {
  compileFrameInstanceRenderable,
  getFrameById,
} from "../src/frame/frame-helpers.js";
import { expandFrameInstance } from "../src/frame/expand-frame.js";
import { technicalArticleExplainerFrameDefinition } from "../src/frames/technical-article-explainer.js";
import { technicalArticleExplainerFrame } from "../src/frames/technical-article-explainer-fluent.js";
import {
  buildLibraryUsageFrameInstance,
  buildLibraryUsageSemanticFills,
  buildLibraryUsageProseFills,
} from "./fixtures/library-usage-frame.js";

describe("frame helpers", () => {
  it("returns built-in frames from the registry", () => {
    expect(getFrameById("technical_article.explainer")?.frameId).toBe(
      "technical_article.explainer",
    );
    expect(getFrameById("unknown.frame")).toBeUndefined();
  });

  it("marks compile invalid when required semantic fields are missing", () => {
    const compileResult = compileFrameInstanceRenderable(
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
        }),
      ]),
    );
  });

  it("reports frame id mismatches as errors", () => {
    const expansionResult = expandFrameInstance(technicalArticleExplainerFrameDefinition, {
      frameId: "wrong.frame",
      title: "Mismatch",
      semanticFills: {},
      proseFills: {},
    });

    expect(expansionResult.expansionDiagnoses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: FRAME_DIAGNOSTIC_CODES.frameIdMismatch,
          severity: "error",
        }),
      ]),
    );
  });
});

describe("technicalArticleExplainerFrame fluent API", () => {
  it("produces equivalent graphs from fluent and plain instance paths", () => {
    const plainInstance = buildLibraryUsageFrameInstance();
    let author = technicalArticleExplainerFrame(plainInstance.title);

    for (const [paragraphId, semanticFill] of Object.entries(plainInstance.semanticFills)) {
      author = author.fillSemantic(paragraphId, semanticFill);
    }

    for (const [paragraphId, proseFill] of Object.entries(plainInstance.proseFills)) {
      author = author.fillProse(paragraphId, proseFill);
    }

    author = author.deviateFromMany(plainInstance.deviations ?? []);
    const fluentGraph = author.toGraph();
    const plainGraph = expandFrameInstance(
      technicalArticleExplainerFrameDefinition,
      plainInstance,
    ).graph;

    expect(fluentGraph).toEqual(plainGraph);
  });

  it("compiles and renders through the fluent API", () => {
    let author = technicalArticleExplainerFrame("How to use docshape");

    for (const [paragraphId, semanticFill] of Object.entries(buildLibraryUsageSemanticFills())) {
      author = author.fillSemantic(paragraphId, semanticFill);
    }

    for (const [paragraphId, proseFill] of Object.entries(buildLibraryUsageProseFills())) {
      author = author.fillProse(paragraphId, proseFill);
    }

    author = author.deviate(
      "summaryLimitations",
      "This short article does not need a separate limitations section.",
    );

    const compileResult = author.compileRenderable();
    const markdown = author.renderMarkdown();

    expect(compileResult.isValid).toBe(true);
    expect(markdown).toContain("Docshape usage starts with a typed graph");
  });

  it("rejects deviations without a reason", () => {
    let author = technicalArticleExplainerFrame("Invalid deviation");

    for (const [paragraphId, semanticFill] of Object.entries(buildLibraryUsageSemanticFills())) {
      author = author.fillSemantic(paragraphId, semanticFill);
    }

    for (const [paragraphId, proseFill] of Object.entries(buildLibraryUsageProseFills())) {
      author = author.fillProse(paragraphId, proseFill);
    }

    const compileResult = author.deviate("summaryLimitations", "   ").compileRenderable();

    expect(compileResult.isValid).toBe(false);
    expect(compileResult.diagnoses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: FRAME_DIAGNOSTIC_CODES.missingDeviationReason,
          severity: "error",
        }),
      ]),
    );
  });
});
