import { describe, expect, it } from "vitest";
import {
  compileStructural,
  defineDocumentSchema,
  TECHNICAL_ARTICLE_DIAGNOSTIC_CODES,
  technicalArticleSchema,
} from "../src/index.js";
import type { ConstraintEvaluationContext, Diagnosis } from "../src/index.js";
import {
  designDecisionWithoutDependencyGraph,
  summaryWithoutTargetGraph,
  unsupportedClaimGraph,
} from "./fixtures/sample-graphs.js";

describe("technical_article schema", () => {
  it("reports unsupported claim nodes", () => {
    const compileResult = compileStructural(unsupportedClaimGraph, technicalArticleSchema);

    expect(compileResult.isValid).toBe(false);
    expect(compileResult.diagnoses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: TECHNICAL_ARTICLE_DIAGNOSTIC_CODES.unsupportedClaim,
          nodeId: "sentence-claim",
        }),
      ]),
    );
  });

  it("reports summary nodes without summarized targets", () => {
    const compileResult = compileStructural(summaryWithoutTargetGraph, technicalArticleSchema);

    expect(compileResult.isValid).toBe(false);
    expect(compileResult.diagnoses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: TECHNICAL_ARTICLE_DIAGNOSTIC_CODES.summaryWithoutTarget,
          nodeId: "sentence-summary",
        }),
      ]),
    );
  });

  it("reports design decisions without reason or constraint dependencies", () => {
    const compileResult = compileStructural(
      designDecisionWithoutDependencyGraph,
      technicalArticleSchema,
    );

    expect(compileResult.isValid).toBe(false);
    expect(compileResult.diagnoses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: TECHNICAL_ARTICLE_DIAGNOSTIC_CODES.designDecisionWithoutDependency,
          nodeId: "sentence-decision",
        }),
      ]),
    );
  });

  it("supports predicate constraints without mutating the graph", () => {
    const predicateSchema = defineDocumentSchema({
      ...technicalArticleSchema,
      predicateConstraints: [
        {
          id: "custom-background-check",
          evaluate: (context: ConstraintEvaluationContext): Diagnosis[] => {
            if (context.node.role !== "background") {
              return [];
            }

            return [
              {
                code: "TA-CUSTOM-001",
                severity: "warning",
                message: "Background nodes should include explanatory links.",
                nodeId: context.node.id,
              },
            ];
          },
        },
      ],
    });

    const compileResult = compileStructural(unsupportedClaimGraph, predicateSchema);

    expect(compileResult.diagnoses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "TA-CUSTOM-001",
          severity: "warning",
          nodeId: "section-body",
        }),
      ]),
    );
  });
});
