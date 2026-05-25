import { describe, expect, it } from "vitest";
import { FRAME_DIAGNOSTIC_CODES } from "../src/constants/frame-diagnostic-codes.js";
import { resolveParagraphPatterns } from "../src/frame/resolve-paragraph-patterns.js";
import { technicalArticleExplainerFrameDefinition } from "../src/frames/technical-article-explainer.js";
import {
  buildLibraryUsageSemanticFills,
  buildLibraryUsageSemanticOnlyFrameInstance,
} from "./fixtures/library-usage-frame.js";

describe("resolveParagraphPatterns", () => {
  it("reports missing required semantic fields as errors", () => {
    const resolution = resolveParagraphPatterns(technicalArticleExplainerFrameDefinition, {
      frameId: "technical_article.explainer",
      title: "Incomplete article",
      semanticFills: {},
      proseFills: {},
    });

    expect(resolution.diagnoses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: FRAME_DIAGNOSTIC_CODES.missingRequiredSemanticField,
          severity: "error",
          nodeId: "introductionProblem.domain",
        }),
      ]),
    );
  });

  it("records reasoned deviations as info diagnoses", () => {
    const resolution = resolveParagraphPatterns(
      technicalArticleExplainerFrameDefinition,
      buildLibraryUsageSemanticOnlyFrameInstance(),
    );

    expect(resolution.diagnoses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: FRAME_DIAGNOSTIC_CODES.paragraphDeviated,
          severity: "info",
          nodeId: "summaryLimitations",
        }),
      ]),
    );
  });

  it("warns on unknown semantic fields for a paragraph pattern", () => {
    const resolution = resolveParagraphPatterns(technicalArticleExplainerFrameDefinition, {
      frameId: "technical_article.explainer",
      title: "Unknown field article",
      semanticFills: {
        introductionProblem: {
          ...buildLibraryUsageSemanticFills().introductionProblem,
          unknownField: { kind: "text", value: "unexpected" },
        },
      },
      proseFills: {},
    });

    expect(resolution.diagnoses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: FRAME_DIAGNOSTIC_CODES.unknownSemanticField,
          severity: "warning",
          nodeId: "introductionProblem.unknownField",
        }),
      ]),
    );
  });
});
