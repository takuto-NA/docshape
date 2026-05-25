import { describe, expect, it } from "vitest";
import {
  CORE_DIAGNOSTIC_CODES,
  compileRenderable,
  compileStructural,
  technicalArticleSchema,
} from "../src/index.js";
import {
  emptyTextTechnicalArticleGraph,
  filledTextTechnicalArticleGraph,
} from "./fixtures/sample-graphs.js";

describe("compileRenderable", () => {
  it("reports missing required text on the same graph accepted by structural compile", () => {
    const structuralResult = compileStructural(
      emptyTextTechnicalArticleGraph,
      technicalArticleSchema,
    );
    const renderableResult = compileRenderable(
      emptyTextTechnicalArticleGraph,
      technicalArticleSchema,
    );

    expect(structuralResult.isValid).toBe(true);
    expect(renderableResult.isValid).toBe(false);
    expect(renderableResult.diagnoses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: CORE_DIAGNOSTIC_CODES.missingRequiredText,
          severity: "error",
        }),
      ]),
    );
  });

  it("passes when required sentence text is present", () => {
    const renderableResult = compileRenderable(
      filledTextTechnicalArticleGraph,
      technicalArticleSchema,
    );

    expect(renderableResult.isValid).toBe(true);
  });
});
