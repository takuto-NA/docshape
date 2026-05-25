/**
 * Shared SemanticDocumentGraph fixtures for compiler tests.
 */

import {
  createSemanticDocumentNode,
  defineSemanticDocumentGraph,
} from "../../src/index.js";

export const emptyTextTechnicalArticleGraph = defineSemanticDocumentGraph(
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
        children: [
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
                  {
                    type: "supports",
                    targetId: "sentence-claim",
                  },
                ],
              }),
            ],
          }),
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
        ],
      }),
    ],
  }),
);

export const filledTextTechnicalArticleGraph = defineSemanticDocumentGraph(
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
        children: [
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
                text: "Structure-first authoring keeps role and link obligations explicit.",
                links: [
                  {
                    type: "supports",
                    targetId: "sentence-claim",
                  },
                ],
              }),
            ],
          }),
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
                text: "The compiler validates semantic structure before rendering.",
                links: [],
              }),
            ],
          }),
        ],
      }),
    ],
  }),
);

export const treeOrderMarkdownGraph = defineSemanticDocumentGraph(
  createSemanticDocumentNode({
    id: "document-root",
    layer: "document",
    role: "document",
    text: "",
    links: [],
    children: [
      createSemanticDocumentNode({
        id: "section-background",
        layer: "section",
        role: "background",
        text: "Background",
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
                text: "Background sentence appears first.",
                links: [],
              }),
            ],
          }),
        ],
      }),
      createSemanticDocumentNode({
        id: "section-method",
        layer: "section",
        role: "design_decision",
        text: "Method",
        links: [],
        children: [
          createSemanticDocumentNode({
            id: "paragraph-method",
            layer: "paragraph",
            role: "design_decision",
            text: "",
            links: [],
            children: [
              createSemanticDocumentNode({
                id: "sentence-method",
                layer: "sentence",
                role: "design_decision",
                text: "Method sentence appears second.",
                links: [],
              }),
            ],
          }),
        ],
      }),
    ],
  }),
);

export const unsupportedClaimGraph = defineSemanticDocumentGraph(
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
        ],
      }),
    ],
  }),
);

export const summaryWithoutTargetGraph = defineSemanticDocumentGraph(
  createSemanticDocumentNode({
    id: "document-root",
    layer: "document",
    role: "document",
    text: "",
    links: [],
    children: [
      createSemanticDocumentNode({
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
                links: [],
              }),
            ],
          }),
        ],
      }),
    ],
  }),
);

export const designDecisionWithoutDependencyGraph = defineSemanticDocumentGraph(
  createSemanticDocumentNode({
    id: "document-root",
    layer: "document",
    role: "document",
    text: "",
    links: [],
    children: [
      createSemanticDocumentNode({
        id: "section-decision",
        layer: "section",
        role: "design_decision",
        text: "Decision",
        links: [],
        children: [
          createSemanticDocumentNode({
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
                links: [],
              }),
            ],
          }),
        ],
      }),
    ],
  }),
);
