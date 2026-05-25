import { describe, expect, it } from "vitest";
import {
  buildLogicalParagraphId,
  buildLogicalSectionId,
  buildLogicalSentenceId,
  buildSentenceReferenceKey,
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
      "introductionProblem",
      "sentence",
      "problemStatement",
    ]);

    expect(nodeId).toBe(
      "technical_article.explainer.how-to-use-docshape.introductionProblem.sentence.problemStatement",
    );
  });

  it("supports logical id overrides", () => {
    const logicalId = buildLogicalSentenceId(
      "technical_article.explainer",
      "how-to-use-docshape",
      "compileModesClaim",
      "claimStatement",
    );

    expect(
      resolveNodeId("technical_article.explainer", "how-to-use-docshape", logicalId, {
        [logicalId]: "custom-claim-id",
      }),
    ).toBe("custom-claim-id");
  });

  it("generates stable section and paragraph ids", () => {
    expect(
      buildLogicalSectionId("technical_article.explainer", "how-to-use-docshape", "workflow"),
    ).toBe("technical_article.explainer.how-to-use-docshape.workflow.section");
    expect(
      buildLogicalParagraphId(
        "technical_article.explainer",
        "how-to-use-docshape",
        "workflowBackground",
      ),
    ).toBe("technical_article.explainer.how-to-use-docshape.workflowBackground.paragraph");
  });

  it("builds stable sentence reference keys", () => {
    expect(buildSentenceReferenceKey("compileModesClaim", "claimStatement")).toBe(
      "compileModesClaim::claimStatement",
    );
  });
});
