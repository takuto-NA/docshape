import { describe, expect, it } from "vitest";
import {
  compileStructural,
  defineSemanticDocumentGraph,
  technicalArticleSchema,
} from "../src/index.js";

describe("package smoke test", () => {
  it("imports the public core API", () => {
    const graph = defineSemanticDocumentGraph({
      id: "document-root",
      layer: "document",
      role: "document",
      text: "",
      links: [],
      children: [],
    });

    const compileResult = compileStructural(graph, technicalArticleSchema);

    expect(compileResult.isValid).toBe(true);
  });
});
