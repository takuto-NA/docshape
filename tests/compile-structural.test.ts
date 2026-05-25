import { describe, expect, it } from "vitest";
import {
  CORE_DIAGNOSTIC_CODES,
  compileStructural,
  createSemanticDocumentNode,
  defineSemanticDocumentGraph,
  technicalArticleSchema,
} from "../src/index.js";
import { emptyTextTechnicalArticleGraph } from "./fixtures/sample-graphs.js";

describe("compileStructural", () => {
  it("accepts empty sentence text when structure is valid", () => {
    const compileResult = compileStructural(
      emptyTextTechnicalArticleGraph,
      technicalArticleSchema,
    );

    expect(compileResult.isValid).toBe(true);
    expect(compileResult.diagnoses).toHaveLength(0);
  });

  it("reports duplicate node ids as errors", () => {
    const duplicateChildNode = createSemanticDocumentNode({
      id: "duplicate-node",
      layer: "sentence",
      role: "background",
      text: "",
      links: [],
    });

    const graph = defineSemanticDocumentGraph(
      createSemanticDocumentNode({
        id: "document-root",
        layer: "document",
        role: "document",
        text: "",
        links: [],
        children: [
          createSemanticDocumentNode({
            id: "section-body",
            layer: "section",
            role: "background",
            text: "Body",
            links: [],
            children: [
              createSemanticDocumentNode({
                id: "paragraph-one",
                layer: "paragraph",
                role: "background",
                text: "",
                links: [],
                children: [duplicateChildNode],
              }),
              createSemanticDocumentNode({
                id: "paragraph-two",
                layer: "paragraph",
                role: "background",
                text: "",
                links: [],
                children: [
                  createSemanticDocumentNode({
                    ...duplicateChildNode,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    );

    const compileResult = compileStructural(graph, technicalArticleSchema);

    expect(compileResult.isValid).toBe(false);
    expect(compileResult.diagnoses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: CORE_DIAGNOSTIC_CODES.duplicateNodeId,
          severity: "error",
          nodeId: "duplicate-node",
        }),
      ]),
    );
  });

  it("reports invalid layer nesting as errors", () => {
    const graph = defineSemanticDocumentGraph(
      createSemanticDocumentNode({
        id: "document-root",
        layer: "document",
        role: "document",
        text: "",
        links: [],
        children: [
          createSemanticDocumentNode({
            id: "invalid-sentence-under-document",
            layer: "sentence",
            role: "background",
            text: "",
            links: [],
          }),
        ],
      }),
    );

    const compileResult = compileStructural(graph, technicalArticleSchema);

    expect(compileResult.isValid).toBe(false);
    expect(compileResult.diagnoses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: CORE_DIAGNOSTIC_CODES.invalidLayerNesting,
          severity: "error",
          nodeId: "invalid-sentence-under-document",
        }),
      ]),
    );
  });

  it("reports invalid roles and link types as errors", () => {
    const graph = defineSemanticDocumentGraph(
      createSemanticDocumentNode({
        id: "document-root",
        layer: "document",
        role: "document",
        text: "",
        links: [],
        children: [
          createSemanticDocumentNode({
            id: "section-body",
            layer: "section",
            role: "unknown_role",
            text: "Body",
            links: [
              {
                type: "unknown_link",
                targetId: "missing-target",
              },
            ],
          }),
        ],
      }),
    );

    const compileResult = compileStructural(graph, technicalArticleSchema);

    expect(compileResult.isValid).toBe(false);
    expect(compileResult.diagnoses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: CORE_DIAGNOSTIC_CODES.invalidRole,
          nodeId: "section-body",
        }),
        expect.objectContaining({
          code: CORE_DIAGNOSTIC_CODES.invalidLinkType,
          nodeId: "section-body",
        }),
        expect.objectContaining({
          code: CORE_DIAGNOSTIC_CODES.brokenLinkTarget,
          nodeId: "section-body",
        }),
      ]),
    );
  });

  it("returns compile metadata with node and parent lookups", () => {
    const compileResult = compileStructural(
      emptyTextTechnicalArticleGraph,
      technicalArticleSchema,
    );

    expect(compileResult.metadata.nodeIndex.has("sentence-claim")).toBe(true);
    expect(compileResult.metadata.parentLookup.get("sentence-claim")).toBe("paragraph-claim");
  });
});
