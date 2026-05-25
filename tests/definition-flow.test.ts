/**
 * Definition Flow validation tests for technical_article concept availability.
 */

import { describe, expect, it } from "vitest";
import {
  compileRenderable,
  compileStructural,
  CORE_DIAGNOSTIC_CODES,
  createSemanticDocumentNode,
  defineSemanticDocumentGraph,
  expandFrameInstance,
  TECHNICAL_ARTICLE_DIAGNOSTIC_CODES,
  technicalArticleSchema,
} from "../src/index.js";
import { buildLogicalSentenceId } from "../src/frame/id-generator.js";
import { technicalArticleExplainerFrameDefinition } from "../src/frames/technical-article-explainer.js";
import { buildLibraryUsageSemanticOnlyFrameInstance } from "./fixtures/library-usage-frame.js";

function buildDefinitionFlowGraph(options: { definitionBeforeUse: boolean }) {
  const definitionParagraph = createSemanticDocumentNode({
    id: "paragraph-definition",
    layer: "paragraph",
    role: "definition",
    text: "",
    links: [],
    children: [
      createSemanticDocumentNode({
        id: "sentence-definition",
        layer: "sentence",
        role: "definition",
        text: "",
        links: [],
        semanticPayload: {
          term: { kind: "text", value: "SemanticDocumentGraph" },
        },
      }),
    ],
  });

  const usingParagraph = createSemanticDocumentNode({
    id: "paragraph-goal",
    layer: "paragraph",
    role: "goal",
    text: "",
    links: [],
    children: [
      createSemanticDocumentNode({
        id: "sentence-goal",
        layer: "sentence",
        role: "goal",
        text: "",
        links: [],
        semanticPayload: {
          concept: { kind: "reference", value: "sentence-definition" },
        },
      }),
    ],
  });

  const sectionChildren = options.definitionBeforeUse
    ? [definitionParagraph, usingParagraph]
    : [usingParagraph, definitionParagraph];

  return defineSemanticDocumentGraph(
    createSemanticDocumentNode({
      id: "document-root",
      layer: "document",
      role: "document",
      text: "",
      links: [],
      children: [
        createSemanticDocumentNode({
          id: "section-introduction",
          layer: "section",
          role: "background",
          text: "Introduction",
          links: [],
          children: sectionChildren,
        }),
      ],
    }),
  );
}

function buildMissingReferenceTargetGraph() {
  return defineSemanticDocumentGraph(
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
              id: "paragraph-goal",
              layer: "paragraph",
              role: "goal",
              text: "",
              links: [],
              children: [
                createSemanticDocumentNode({
                  id: "sentence-goal",
                  layer: "sentence",
                  role: "goal",
                  text: "",
                  links: [],
                  semanticPayload: {
                    concept: { kind: "reference", value: "sentence-missing" },
                  },
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  );
}

function buildNonDefinitionReferenceTargetGraph() {
  return defineSemanticDocumentGraph(
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
              id: "paragraph-background",
              layer: "paragraph",
              role: "background",
              text: "",
              links: [],
              children: [
                createSemanticDocumentNode({
                  id: "sentence-background",
                  layer: "sentence",
                  role: "background",
                  text: "",
                  links: [],
                }),
              ],
            }),
            createSemanticDocumentNode({
              id: "paragraph-goal",
              layer: "paragraph",
              role: "goal",
              text: "",
              links: [],
              children: [
                createSemanticDocumentNode({
                  id: "sentence-goal",
                  layer: "sentence",
                  role: "goal",
                  text: "",
                  links: [],
                  semanticPayload: {
                    concept: { kind: "reference", value: "sentence-background" },
                  },
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  );
}

function buildParagraphLevelReferenceGraph() {
  return defineSemanticDocumentGraph(
    createSemanticDocumentNode({
      id: "document-root",
      layer: "document",
      role: "document",
      text: "",
      links: [],
      semanticPayload: {
        overviewConcept: { kind: "reference", value: "sentence-definition" },
      },
      children: [
        createSemanticDocumentNode({
          id: "section-body",
          layer: "section",
          role: "background",
          text: "Body",
          links: [],
          children: [
            createSemanticDocumentNode({
              id: "paragraph-definition",
              layer: "paragraph",
              role: "definition",
              text: "",
              links: [],
              children: [
                createSemanticDocumentNode({
                  id: "sentence-definition",
                  layer: "sentence",
                  role: "definition",
                  text: "",
                  links: [],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  );
}

describe("Definition Flow validation", () => {
  it("reports TA-DEF-001 when a semantic reference target does not exist", () => {
    const graph = buildMissingReferenceTargetGraph();
    const compileResult = compileStructural(graph, technicalArticleSchema);

    expect(compileResult.isValid).toBe(false);
    expect(compileResult.diagnoses).toEqual([
      expect.objectContaining({
        code: TECHNICAL_ARTICLE_DIAGNOSTIC_CODES.missingReferenceTarget,
        nodeId: "sentence-goal",
      }),
    ]);
  });

  it("reports TA-DEF-002 when a semantic reference target is not role definition", () => {
    const graph = buildNonDefinitionReferenceTargetGraph();
    const compileResult = compileStructural(graph, technicalArticleSchema);

    expect(compileResult.isValid).toBe(false);
    expect(compileResult.diagnoses).toEqual([
      expect.objectContaining({
        code: TECHNICAL_ARTICLE_DIAGNOSTIC_CODES.referenceTargetNotDefinition,
        nodeId: "sentence-goal",
      }),
    ]);
  });

  it("reports TA-DEF-003 when a definition appears after the using node", () => {
    const graph = buildDefinitionFlowGraph({ definitionBeforeUse: false });
    const compileResult = compileStructural(graph, technicalArticleSchema);

    expect(compileResult.isValid).toBe(false);
    expect(compileResult.diagnoses).toEqual([
      expect.objectContaining({
        code: TECHNICAL_ARTICLE_DIAGNOSTIC_CODES.definitionAppearsAfterUse,
        nodeId: "sentence-goal",
      }),
    ]);
  });

  it("accepts semantic references when the definition appears before use", () => {
    const graph = buildDefinitionFlowGraph({ definitionBeforeUse: true });
    const compileResult = compileStructural(graph, technicalArticleSchema);

    expect(compileResult.isValid).toBe(true);
    expect(compileResult.diagnoses).toHaveLength(0);
  });

  it("checks semantic references on non-sentence nodes", () => {
    const graph = buildParagraphLevelReferenceGraph();
    const compileResult = compileStructural(graph, technicalArticleSchema);

    expect(compileResult.isValid).toBe(false);
    expect(compileResult.diagnoses).toEqual([
      expect.objectContaining({
        code: TECHNICAL_ARTICLE_DIAGNOSTIC_CODES.definitionAppearsAfterUse,
        nodeId: "document-root",
      }),
    ]);
  });

  it("includes Definition Flow diagnostics in renderable compile", () => {
    const graph = buildDefinitionFlowGraph({ definitionBeforeUse: false });
    const compileResult = compileRenderable(graph, technicalArticleSchema);

    expect(compileResult.isValid).toBe(false);
    expect(compileResult.diagnoses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: TECHNICAL_ARTICLE_DIAGNOSTIC_CODES.definitionAppearsAfterUse,
        }),
      ]),
    );
  });

  it("emits one definition flow diagnosis per violating reference field", () => {
    const graph = buildDefinitionFlowGraph({ definitionBeforeUse: false });
    const compileResult = compileStructural(graph, technicalArticleSchema);
    const definitionFlowDiagnoses = compileResult.diagnoses.filter((diagnosis) =>
      diagnosis.code.startsWith("TA-DEF-"),
    );

    expect(definitionFlowDiagnoses).toHaveLength(1);
  });

  it("reports broken link targets independently of Definition Flow diagnostics", () => {
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
                id: "paragraph-goal",
                layer: "paragraph",
                role: "goal",
                text: "",
                links: [],
                children: [
                  createSemanticDocumentNode({
                    id: "sentence-goal",
                    layer: "sentence",
                    role: "goal",
                    text: "",
                    links: [{ type: "supports", targetId: "sentence-missing" }],
                    semanticPayload: {
                      concept: { kind: "reference", value: "sentence-missing" },
                    },
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
          code: TECHNICAL_ARTICLE_DIAGNOSTIC_CODES.missingReferenceTarget,
          nodeId: "sentence-goal",
        }),
        expect.objectContaining({
          code: CORE_DIAGNOSTIC_CODES.brokenLinkTarget,
          nodeId: "sentence-goal",
        }),
      ]),
    );
  });

  it("resolves frame-local default references to generated sentence node ids", () => {
    const expansionResult = expandFrameInstance(
      technicalArticleExplainerFrameDefinition,
      buildLibraryUsageSemanticOnlyFrameInstance(),
    );

    const goalSentence = [...expansionResult.graph.root.children ?? []]
      .flatMap((section) => section.children ?? [])
      .flatMap((paragraph) => paragraph.children ?? [])
      .find((sentence) => sentence.id.includes("introductionGoal"));

    const expectedDefinitionSentenceId = buildLogicalSentenceId(
      "technical_article.explainer",
      "how-to-use-docshape",
      "introductionGraphDefinition",
      "definitionStatement",
    );

    expect(goalSentence?.semanticPayload?.solutionConcept).toEqual({
      kind: "reference",
      value: expectedDefinitionSentenceId,
    });
    expect(goalSentence?.semanticPayload?.solutionConcept?.value).not.toContain("::");
  });

  it("passes structural compile for the built-in explainer frame with default concept reference", () => {
    const expansionResult = expandFrameInstance(
      technicalArticleExplainerFrameDefinition,
      buildLibraryUsageSemanticOnlyFrameInstance(),
    );
    const compileResult = compileStructural(expansionResult.graph, technicalArticleSchema);

    expect(compileResult.isValid).toBe(true);
    expect(compileResult.diagnoses.filter((diagnosis) => diagnosis.code.startsWith("TA-DEF-"))).toHaveLength(
      0,
    );
  });

  it("resolves frame-local references using idOverrides for the definition sentence", () => {
    const logicalDefinitionSentenceId = buildLogicalSentenceId(
      "technical_article.explainer",
      "how-to-use-docshape",
      "introductionGraphDefinition",
      "definitionStatement",
    );
    const frameInstance = {
      ...buildLibraryUsageSemanticOnlyFrameInstance(),
      idOverrides: {
        [logicalDefinitionSentenceId]: "custom-definition-sentence-id",
      },
    };
    const expansionResult = expandFrameInstance(
      technicalArticleExplainerFrameDefinition,
      frameInstance,
    );

    const goalSentence = [...expansionResult.graph.root.children ?? []]
      .flatMap((section) => section.children ?? [])
      .flatMap((paragraph) => paragraph.children ?? [])
      .find((sentence) => sentence.id.includes("introductionGoal"));

    expect(goalSentence?.semanticPayload?.solutionConcept).toEqual({
      kind: "reference",
      value: "custom-definition-sentence-id",
    });
  });

  it("reports TA-DEF-001 when a frame-local reference alias cannot be resolved", () => {
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
                id: "paragraph-goal",
                layer: "paragraph",
                role: "goal",
                text: "",
                links: [],
                children: [
                  createSemanticDocumentNode({
                    id: "sentence-goal",
                    layer: "sentence",
                    role: "goal",
                    text: "",
                    links: [],
                    semanticPayload: {
                      concept: {
                        kind: "reference",
                        value: "missingParagraph::missingSentence",
                      },
                    },
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
    expect(compileResult.diagnoses).toEqual([
      expect.objectContaining({
        code: TECHNICAL_ARTICLE_DIAGNOSTIC_CODES.missingReferenceTarget,
        nodeId: "sentence-goal",
      }),
    ]);
  });

  it("emits one definition flow diagnosis per violating reference field on the same node", () => {
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
                id: "paragraph-goal",
                layer: "paragraph",
                role: "goal",
                text: "",
                links: [],
                children: [
                  createSemanticDocumentNode({
                    id: "sentence-goal",
                    layer: "sentence",
                    role: "goal",
                    text: "",
                    links: [],
                    semanticPayload: {
                      primaryConcept: { kind: "reference", value: "sentence-missing-one" },
                      secondaryConcept: { kind: "reference", value: "sentence-missing-two" },
                    },
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    );
    const compileResult = compileStructural(graph, technicalArticleSchema);
    const definitionFlowDiagnoses = compileResult.diagnoses.filter((diagnosis) =>
      diagnosis.code.startsWith("TA-DEF-"),
    );

    expect(definitionFlowDiagnoses).toHaveLength(2);
  });
});
