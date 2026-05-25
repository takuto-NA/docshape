/**
 * Discourse Flow validation for technical_article reading order.
 */

import type {
  ConstraintEvaluationContext,
  Diagnosis,
  SemanticDocumentGraph,
  SemanticDocumentNode,
} from "../types/domain.js";

export const DISCOURSE_FLOW_DIAGNOSTIC_CODES = {
  flowSupportAfterClaim: "TA-FLOW-001",
  flowDependencyAfterDecision: "TA-FLOW-002",
  flowSummaryBeforeTarget: "TA-FLOW-003",
} as const;

export interface ReadingSpan {
  start: number;
  end: number;
}

const readingSpanLookupCache = new WeakMap<SemanticDocumentGraph, Map<string, ReadingSpan>>();

export function getReadingSpanLookup(graph: SemanticDocumentGraph): Map<string, ReadingSpan> {
  const cachedReadingSpanLookup = readingSpanLookupCache.get(graph);

  if (cachedReadingSpanLookup !== undefined) {
    return cachedReadingSpanLookup;
  }

  const readingSpanLookup = buildReadingSpanLookup(graph);
  readingSpanLookupCache.set(graph, readingSpanLookup);
  return readingSpanLookup;
}

export function buildReadingSpanLookup(
  graph: SemanticDocumentGraph,
): Map<string, ReadingSpan> {
  const readingSpanLookup = new Map<string, ReadingSpan>();
  let nextReadingIndex = 0;

  function visitNode(node: SemanticDocumentNode): number {
    const startReadingIndex = nextReadingIndex;
    nextReadingIndex += 1;

    let lastDescendantReadingIndex = startReadingIndex;

    for (const childNode of node.children ?? []) {
      lastDescendantReadingIndex = visitNode(childNode);
    }

    readingSpanLookup.set(node.id, {
      start: startReadingIndex,
      end: lastDescendantReadingIndex,
    });

    return lastDescendantReadingIndex;
  }

  visitNode(graph.root);
  return readingSpanLookup;
}

export function createDiscourseFlowPredicateConstraint(): {
  id: string;
  evaluate: (context: ConstraintEvaluationContext) => Diagnosis[];
} {
  return {
    id: "technical-article-discourse-flow",
    evaluate: evaluateDiscourseFlowForNode,
  };
}

function evaluateDiscourseFlowForNode(context: ConstraintEvaluationContext): Diagnosis[] {
  if (context.outgoingLinks.length === 0) {
    return [];
  }

  const readingSpanLookup = getReadingSpanLookup(context.graph);
  const diagnoses: Diagnosis[] = [];

  for (const outgoingLink of context.outgoingLinks) {
    const sourceReadingSpan = readingSpanLookup.get(outgoingLink.sourceId);
    const targetReadingSpan = readingSpanLookup.get(outgoingLink.targetId);

    if (sourceReadingSpan === undefined || targetReadingSpan === undefined) {
      continue;
    }

    const flowDiagnosis = buildFlowDiagnosisForLink(
      outgoingLink.linkType,
      outgoingLink.sourceId,
      outgoingLink.targetId,
      sourceReadingSpan,
      targetReadingSpan,
    );

    if (flowDiagnosis !== undefined) {
      diagnoses.push(flowDiagnosis);
    }
  }

  return diagnoses;
}

function buildFlowDiagnosisForLink(
  linkType: string,
  sourceNodeId: string,
  targetNodeId: string,
  sourceReadingSpan: ReadingSpan,
  targetReadingSpan: ReadingSpan,
): Diagnosis | undefined {
  if (linkType === "supports") {
    if (sourceReadingSpan.end >= targetReadingSpan.start) {
      return {
        code: DISCOURSE_FLOW_DIAGNOSTIC_CODES.flowSupportAfterClaim,
        severity: "error",
        message:
          `Supporting node "${sourceNodeId}" must appear before supported node "${targetNodeId}" in reading order.`,
        nodeId: sourceNodeId,
      };
    }
    return undefined;
  }

  if (linkType === "depends_on") {
    if (targetReadingSpan.end >= sourceReadingSpan.start) {
      return {
        code: DISCOURSE_FLOW_DIAGNOSTIC_CODES.flowDependencyAfterDecision,
        severity: "error",
        message:
          `Dependency node "${targetNodeId}" must appear before design decision node "${sourceNodeId}" in reading order.`,
        nodeId: sourceNodeId,
      };
    }
    return undefined;
  }

  if (linkType === "summarizes") {
    if (targetReadingSpan.end >= sourceReadingSpan.start) {
      return {
        code: DISCOURSE_FLOW_DIAGNOSTIC_CODES.flowSummaryBeforeTarget,
        severity: "error",
        message:
          `Summarized node "${targetNodeId}" must appear before summary node "${sourceNodeId}" in reading order.`,
        nodeId: sourceNodeId,
      };
    }
    return undefined;
  }

  return undefined;
}
