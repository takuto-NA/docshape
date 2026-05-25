import { describe, expect, it } from "vitest";
import {
  buildLogicalSectionId,
  buildLogicalSlotSentenceId,
  createFrameInstanceKey,
  generateFrameNodeId,
  resolveNodeId,
} from "../src/frame/id-generator.js";

describe("frame id generation", () => {
  it("creates stable instance keys from titles", () => {
    expect(createFrameInstanceKey("How to use docshape")).toBe("how-to-use-docshape");
    expect(createFrameInstanceKey("How to use docshape")).toBe("how-to-use-docshape");
  });

  it("generates deterministic node ids", () => {
    const nodeId = generateFrameNodeId("technical_article.explainer", "how-to-use-docshape", [
      "problem",
      "sentence",
    ]);

    expect(nodeId).toBe("technical_article.explainer.how-to-use-docshape.problem.sentence");
  });

  it("supports logical id overrides", () => {
    const logicalId = buildLogicalSlotSentenceId(
      "technical_article.explainer",
      "how-to-use-docshape",
      "claim",
    );

    expect(
      resolveNodeId("technical_article.explainer", "how-to-use-docshape", logicalId, {
        [logicalId]: "custom-claim-id",
      }),
    ).toBe("custom-claim-id");
  });

  it("generates stable section ids", () => {
    expect(
      buildLogicalSectionId("technical_article.explainer", "how-to-use-docshape", "workflow"),
    ).toBe("technical_article.explainer.how-to-use-docshape.workflow.section");
  });
});
