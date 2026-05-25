import { describe, expect, it } from "vitest";
import { FRAME_DIAGNOSTIC_CODES } from "../src/constants/frame-diagnostic-codes.js";
import {
  compileFrameInstanceRenderable,
  getFrameById,
} from "../src/frame/frame-helpers.js";
import { expandFrameInstance } from "../src/frame/expand-frame.js";
import { technicalArticleExplainerFrameDefinition } from "../src/frames/technical-article-explainer.js";
import { technicalArticleExplainerFrame } from "../src/frames/technical-article-explainer-fluent.js";
import { buildLibraryUsageFrameInstance } from "./fixtures/library-usage-frame.js";

describe("frame helpers", () => {
  it("returns built-in frames from the registry", () => {
    expect(getFrameById("technical_article.explainer")?.frameId).toBe(
      "technical_article.explainer",
    );
    expect(getFrameById("unknown.frame")).toBeUndefined();
  });

  it("marks compile invalid when required slot fills are missing", () => {
    const compileResult = compileFrameInstanceRenderable(
      technicalArticleExplainerFrameDefinition,
      {
        frameId: "technical_article.explainer",
        title: "Incomplete article",
        fills: {},
      },
    );

    expect(compileResult.isValid).toBe(false);
    expect(compileResult.diagnoses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: FRAME_DIAGNOSTIC_CODES.missingRequiredSlotFill,
          severity: "error",
        }),
      ]),
    );
  });

  it("reports frame id mismatches as errors", () => {
    const expansionResult = expandFrameInstance(technicalArticleExplainerFrameDefinition, {
      frameId: "wrong.frame",
      title: "Mismatch",
      fills: {},
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
    const fluentGraph = technicalArticleExplainerFrame(plainInstance.title)
      .fill(plainInstance.fills)
      .deviateFromMany(plainInstance.deviations ?? [])
      .toGraph();
    const plainGraph = expandFrameInstance(
      technicalArticleExplainerFrameDefinition,
      plainInstance,
    ).graph;

    expect(fluentGraph).toEqual(plainGraph);
  });

  it("compiles and renders through the fluent API", () => {
    const plainInstance = buildLibraryUsageFrameInstance();
    const author = technicalArticleExplainerFrame(plainInstance.title)
      .fill(plainInstance.fills)
      .deviateFromMany(plainInstance.deviations ?? []);

    const compileResult = author.compileRenderable();
    const markdown = author.renderMarkdown();

    expect(compileResult.isValid).toBe(true);
    expect(markdown).toContain("Docshape usage starts with a typed graph");
  });

  it("rejects deviations without a reason", () => {
    const compileResult = technicalArticleExplainerFrame("Invalid deviation")
      .fill({
        problem: "Problem text.",
        goal: "Goal text.",
        workflow: "Workflow text.",
        example: "Example text.",
        summary: "Summary text.",
      })
      .deviate("limitations", "   ")
      .compileRenderable();

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
