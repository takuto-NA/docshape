import { describe, expect, it } from "vitest";
import { FRAME_DIAGNOSTIC_CODES } from "../src/constants/frame-diagnostic-codes.js";
import { resolveFrameSlots } from "../src/frame/resolve-slots.js";
import { technicalArticleExplainerFrameDefinition } from "../src/frames/technical-article-explainer.js";

describe("resolveFrameSlots", () => {
  it("reports missing required slot fills as errors", () => {
    const resolution = resolveFrameSlots(technicalArticleExplainerFrameDefinition, {
      frameId: "technical_article.explainer",
      title: "Incomplete article",
      fills: {},
    });

    expect(resolution.diagnoses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: FRAME_DIAGNOSTIC_CODES.missingRequiredSlotFill,
          severity: "error",
          nodeId: "problem",
        }),
      ]),
    );
  });

  it("records reasoned deviations as info diagnoses", () => {
    const resolution = resolveFrameSlots(technicalArticleExplainerFrameDefinition, {
      frameId: "technical_article.explainer",
      title: "Short article",
      fills: {
        problem: "Problem text.",
        goal: "Goal text.",
        workflow: "Workflow text.",
        example: "Example text.",
        summary: "Summary text.",
      },
      deviations: [
        {
          slotId: "limitations",
          reason: "This short article does not need a limitations section.",
        },
      ],
    });

    expect(resolution.diagnoses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: FRAME_DIAGNOSTIC_CODES.slotDeviated,
          severity: "info",
          nodeId: "limitations",
        }),
      ]),
    );
  });
});
