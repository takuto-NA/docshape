/**
 * Discourse Flow validation tests for technical_article reading order.
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
import { technicalArticleExplainerFrameDefinition } from "../src/frames/technical-article-explainer.js";
import { buildLibraryUsageSemanticOnlyFrameInstance } from "./fixtures/library-usage-frame.js";

function buildSupportsFlowGraph(options: { reasonBeforeClaim: boolean }) {
  const reasonParagraph = createSemanticDocumentNode({
    id: "paragraph-reason",
    layer: "paragraph",
    role: "reason",
    text: "",
    links: [],
    children: [
      createSemanticDocumentNode({
        id: "sentence-reason",
        layer: "sentence",
        role: "reason",
        text: "",
        links: [{ type: "supports", targetId: "sentence-claim" }],
      }),
    ],
  });

  const claimParagraph = createSemanticDocumentNode({
    id: "paragraph-claim",
    layer: "paragraph",
    role: "claim",
    text: "",
    links: [],
    children: [
      createSemanticDocumentNode({
        id: "sentence-claim",
        layer: "sentence",
        role: "claim",
        text: "",
        links: [],
      }),
    ],
  });

  const sectionChildren = options.reasonBeforeClaim
    ? [reasonParagraph, claimParagraph]
    : [claimParagraph, reasonParagraph];

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
          children: sectionChildren,
        }),
      ],
    }),
  );
}

function buildDependsOnFlowGraph(options: { constraintBeforeDecision: boolean }) {
  const constraintParagraph = createSemanticDocumentNode({
    id: "paragraph-constraint",
    layer: "paragraph",
    role: "constraint",
    text: "",
    links: [],
    children: [
      createSemanticDocumentNode({
        id: "sentence-constraint",
        layer: "sentence",
        role: "constraint",
        text: "",
        links: [],
      }),
    ],
  });

  const decisionParagraph = createSemanticDocumentNode({
    id: "paragraph-decision",
    layer: "paragraph",
    role: "design_decision",
    text: "",
    links: [],
    children: [
      createSemanticDocumentNode({
        id: "sentence-decision",
        layer: "sentence",
        role: "design_decision",
        text: "",
        links: [{ type: "depends_on", targetId: "sentence-constraint" }],
      }),
    ],
  });

  const sectionChildren = options.constraintBeforeDecision
    ? [constraintParagraph, decisionParagraph]
    : [decisionParagraph, constraintParagraph];

  return defineSemanticDocumentGraph(
    createSemanticDocumentNode({
      id: "document-root",
      layer: "document",
      role: "document",
      text: "",
      links: [],
      children: [
        createSemanticDocumentNode({
          id: "section-workflow",
          layer: "section",
          role: "background",
          text: "Workflow",
          links: [],
          children: sectionChildren,
        }),
      ],
    }),
  );
}

function buildSummarizesFlowGraph(options: { targetSectionBeforeSummary: boolean }) {
  const workflowSection = createSemanticDocumentNode({
    id: "section-workflow",
    layer: "section",
    role: "background",
    text: "Workflow",
    links: [],
    children: [
      createSemanticDocumentNode({
        id: "paragraph-workflow",
        layer: "paragraph",
        role: "background",
        text: "",
        links: [],
        children: [
          createSemanticDocumentNode({
            id: "sentence-workflow",
            layer: "sentence",
            role: "background",
            text: "",
            links: [],
          }),
        ],
      }),
    ],
  });

  const summarySection = createSemanticDocumentNode({
    id: "section-summary",
    layer: "section",
    role: "summary",
    text: "Summary",
    links: [],
    children: [
      createSemanticDocumentNode({
        id: "paragraph-summary",
        layer: "paragraph",
        role: "summary",
        text: "",
        links: [],
        children: [
          createSemanticDocumentNode({
            id: "sentence-summary",
            layer: "sentence",
            role: "summary",
            text: "",
            links: [{ type: "summarizes", targetId: "section-workflow" }],
          }),
        ],
      }),
    ],
  });

  const documentChildren = options.targetSectionBeforeSummary
    ? [workflowSection, summarySection]
    : [summarySection, workflowSection];

  return defineSemanticDocumentGraph(
    createSemanticDocumentNode({
      id: "document-root",
      layer: "document",
      role: "document",
      text: "",
      links: [],
      children: documentChildren,
    }),
  );
}

function buildIntraSectionSummarizesViolationGraph() {
  return defineSemanticDocumentGraph(
    createSemanticDocumentNode({
      id: "document-root",
      layer: "document",
      role: "document",
      text: "",
      links: [],
      children: [
        createSemanticDocumentNode({
          id: "section-workflow",
          layer: "section",
          role: "background",
          text: "Workflow",
          links: [],
          children: [
            createSemanticDocumentNode({
              id: "paragraph-summary",
              layer: "paragraph",
              role: "summary",
              text: "",
              links: [],
              children: [
                createSemanticDocumentNode({
                  id: "sentence-summary",
                  layer: "sentence",
                  role: "summary",
                  text: "",
                  links: [{ type: "summarizes", targetId: "section-workflow" }],
                }),
              ],
            }),
            createSemanticDocumentNode({
              id: "paragraph-detail",
              layer: "paragraph",
              role: "background",
              text: "",
              links: [],
              children: [
                createSemanticDocumentNode({
                  id: "sentence-detail",
                  layer: "sentence",
                  role: "background",
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

function buildBrokenTargetWithBadFlowGraph() {
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
              id: "paragraph-claim",
              layer: "paragraph",
              role: "claim",
              text: "",
              links: [],
              children: [
                createSemanticDocumentNode({
                  id: "sentence-claim",
                  layer: "sentence",
                  role: "claim",
                  text: "",
                  links: [],
                }),
              ],
            }),
            createSemanticDocumentNode({
              id: "paragraph-reason",
              layer: "paragraph",
              role: "reason",
              text: "",
              links: [],
              children: [
                createSemanticDocumentNode({
                  id: "sentence-reason",
                  layer: "sentence",
                  role: "reason",
                  text: "",
                  links: [
                    { type: "supports", targetId: "sentence-claim" },
                    { type: "supports", targetId: "sentence-missing" },
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  );
}

describe("Discourse Flow validation", () => {
  it("reports TA-FLOW-001 when a supported claim appears before its supporting reason", () => {
    const graph = buildSupportsFlowGraph({ reasonBeforeClaim: false });
    const compileResult = compileStructural(graph, technicalArticleSchema);

    expect(compileResult.isValid).toBe(false);
    expect(compileResult.diagnoses).toEqual([
      expect.objectContaining({
        code: TECHNICAL_ARTICLE_DIAGNOSTIC_CODES.flowSupportAfterClaim,
        nodeId: "sentence-reason",
      }),
    ]);
  });

  it("accepts supports links when the reason appears before the claim", () => {
    const graph = buildSupportsFlowGraph({ reasonBeforeClaim: true });
    const compileResult = compileStructural(graph, technicalArticleSchema);

    expect(compileResult.isValid).toBe(true);
    expect(compileResult.diagnoses).toHaveLength(0);
  });

  it("reports TA-FLOW-002 when a design decision appears before its dependency", () => {
    const graph = buildDependsOnFlowGraph({ constraintBeforeDecision: false });
    const compileResult = compileStructural(graph, technicalArticleSchema);

    expect(compileResult.isValid).toBe(false);
    expect(compileResult.diagnoses).toEqual([
      expect.objectContaining({
        code: TECHNICAL_ARTICLE_DIAGNOSTIC_CODES.flowDependencyAfterDecision,
        nodeId: "sentence-decision",
      }),
    ]);
  });

  it("accepts depends_on links when the dependency appears before the decision", () => {
    const graph = buildDependsOnFlowGraph({ constraintBeforeDecision: true });
    const compileResult = compileStructural(graph, technicalArticleSchema);

    expect(compileResult.isValid).toBe(true);
    expect(compileResult.diagnoses).toHaveLength(0);
  });

  it("reports TA-FLOW-003 when a summary appears before the summarized section subtree", () => {
    const graph = buildSummarizesFlowGraph({ targetSectionBeforeSummary: false });
    const compileResult = compileStructural(graph, technicalArticleSchema);

    expect(compileResult.isValid).toBe(false);
    expect(compileResult.diagnoses).toEqual([
      expect.objectContaining({
        code: TECHNICAL_ARTICLE_DIAGNOSTIC_CODES.flowSummaryBeforeTarget,
        nodeId: "sentence-summary",
      }),
    ]);
  });

  it("accepts summarizes links when the target section subtree appears before the summary", () => {
    const graph = buildSummarizesFlowGraph({ targetSectionBeforeSummary: true });
    const compileResult = compileStructural(graph, technicalArticleSchema);

    expect(compileResult.isValid).toBe(true);
    expect(compileResult.diagnoses).toHaveLength(0);
  });

  it("reports TA-FLOW-003 when a summary appears before the rest of the summarized section subtree", () => {
    const graph = buildIntraSectionSummarizesViolationGraph();
    const compileResult = compileStructural(graph, technicalArticleSchema);

    expect(compileResult.isValid).toBe(false);
    expect(compileResult.diagnoses).toEqual([
      expect.objectContaining({
        code: TECHNICAL_ARTICLE_DIAGNOSTIC_CODES.flowSummaryBeforeTarget,
        nodeId: "sentence-summary",
      }),
    ]);
  });

  it("reports broken link targets independently of Discourse Flow diagnostics", () => {
    const graph = buildBrokenTargetWithBadFlowGraph();
    const compileResult = compileStructural(graph, technicalArticleSchema);

    expect(compileResult.isValid).toBe(false);
    expect(compileResult.diagnoses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: TECHNICAL_ARTICLE_DIAGNOSTIC_CODES.flowSupportAfterClaim,
          nodeId: "sentence-reason",
        }),
        expect.objectContaining({
          code: CORE_DIAGNOSTIC_CODES.brokenLinkTarget,
          nodeId: "sentence-reason",
        }),
      ]),
    );
  });

  it("includes Discourse Flow diagnostics in renderable compile", () => {
    const graph = buildSupportsFlowGraph({ reasonBeforeClaim: false });
    const compileResult = compileRenderable(graph, technicalArticleSchema);

    expect(compileResult.isValid).toBe(false);
    expect(compileResult.diagnoses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: TECHNICAL_ARTICLE_DIAGNOSTIC_CODES.flowSupportAfterClaim,
        }),
      ]),
    );
  });

  it("emits one flow diagnosis per violating outgoing link", () => {
    const graph = buildSupportsFlowGraph({ reasonBeforeClaim: false });
    const compileResult = compileStructural(graph, technicalArticleSchema);
    const flowDiagnoses = compileResult.diagnoses.filter((diagnosis) =>
      diagnosis.code.startsWith("TA-FLOW-"),
    );

    expect(flowDiagnoses).toHaveLength(1);
  });

  it("passes structural compile for the built-in explainer frame after Discourse Flow reordering", () => {
    const expansionResult = expandFrameInstance(
      technicalArticleExplainerFrameDefinition,
      buildLibraryUsageSemanticOnlyFrameInstance(),
    );
    const compileResult = compileStructural(expansionResult.graph, technicalArticleSchema);

    expect(compileResult.isValid).toBe(true);
    expect(compileResult.diagnoses.filter((diagnosis) => diagnosis.code.startsWith("TA-FLOW-"))).toHaveLength(
      0,
    );
  });
});
