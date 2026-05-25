import { describe, expect, it } from "vitest";
import {
  compileStructural,
  TECHNICAL_ARTICLE_DIAGNOSTIC_CODES,
  technicalArticleSchema,
} from "../src/index.js";
import {
  summaryWithoutTargetGraph,
  unsupportedClaimGraph,
} from "./fixtures/sample-graphs.js";

describe("PatchPlan suggestions", () => {
  it("emits suggested operations without mutating the graph", () => {
    const originalGraph = structuredClone(unsupportedClaimGraph);
    const compileResult = compileStructural(unsupportedClaimGraph, technicalArticleSchema);

    const claimDiagnosis = compileResult.diagnoses.find(
      (diagnosis) =>
        diagnosis.code === TECHNICAL_ARTICLE_DIAGNOSTIC_CODES.unsupportedClaim &&
        diagnosis.nodeId === "sentence-claim",
    );

    expect(claimDiagnosis?.suggestedOperations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "insert_paragraph",
          role: "reason",
        }),
      ]),
    );
    expect(unsupportedClaimGraph).toEqual(originalGraph);
  });

  it("suggests add_link operations for summary violations", () => {
    const compileResult = compileStructural(summaryWithoutTargetGraph, technicalArticleSchema);

    const summaryDiagnosis = compileResult.diagnoses.find(
      (diagnosis) =>
        diagnosis.code === TECHNICAL_ARTICLE_DIAGNOSTIC_CODES.summaryWithoutTarget &&
        diagnosis.nodeId === "sentence-summary",
    );

    expect(summaryDiagnosis?.suggestedOperations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "add_link",
          link: "summarizes",
        }),
      ]),
    );
  });
});
