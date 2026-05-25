/**
 * Definition Flow validation for technical_article concept availability.
 */

import type { ConstraintEvaluationContext, Diagnosis, SemanticValue } from "../types/domain.js";
import { getReadingSpanLookup, type ReadingSpan } from "./discourse-flow.js";

export const DEFINITION_FLOW_DIAGNOSTIC_CODES = {
  missingReferenceTarget: "TA-DEF-001",
  referenceTargetNotDefinition: "TA-DEF-002",
  definitionAppearsAfterUse: "TA-DEF-003",
} as const;

export function createDefinitionFlowPredicateConstraint(): {
  id: string;
  evaluate: (context: ConstraintEvaluationContext) => Diagnosis[];
} {
  return {
    id: "technical-article-definition-flow",
    evaluate: evaluateDefinitionFlowForNode,
  };
}

function evaluateDefinitionFlowForNode(context: ConstraintEvaluationContext): Diagnosis[] {
  const semanticPayload = context.node.node.semanticPayload;

  if (semanticPayload === undefined || Object.keys(semanticPayload).length === 0) {
    return [];
  }

  const readingSpanLookup = getReadingSpanLookup(context.graph);
  const usingNodeReadingSpan = readingSpanLookup.get(context.node.id);

  if (usingNodeReadingSpan === undefined) {
    return [];
  }

  const diagnoses: Diagnosis[] = [];

  for (const [semanticFieldId, semanticValue] of Object.entries(semanticPayload)) {
    if (semanticValue.kind !== "reference") {
      continue;
    }

    const definitionFlowDiagnosis = buildDefinitionFlowDiagnosisForReference(
      context,
      semanticFieldId,
      semanticValue,
      usingNodeReadingSpan,
      readingSpanLookup,
    );

    if (definitionFlowDiagnosis !== undefined) {
      diagnoses.push(definitionFlowDiagnosis);
    }
  }

  return diagnoses;
}

function buildDefinitionFlowDiagnosisForReference(
  context: ConstraintEvaluationContext,
  semanticFieldId: string,
  semanticValue: SemanticValue,
  usingNodeReadingSpan: ReadingSpan,
  readingSpanLookup: Map<string, ReadingSpan>,
): Diagnosis | undefined {
  if (semanticValue.kind !== "reference") {
    return undefined;
  }

  const referencedNodeId = semanticValue.value;
  const referencedNode = context.nodeIndex.get(referencedNodeId);

  if (referencedNode === undefined) {
    return {
      code: DEFINITION_FLOW_DIAGNOSTIC_CODES.missingReferenceTarget,
      severity: "error",
      message:
        `Semantic reference field "${semanticFieldId}" on node "${context.node.id}" points to missing node "${referencedNodeId}".`,
      nodeId: context.node.id,
    };
  }

  if (referencedNode.role !== "definition") {
    return {
      code: DEFINITION_FLOW_DIAGNOSTIC_CODES.referenceTargetNotDefinition,
      severity: "error",
      message:
        `Semantic reference field "${semanticFieldId}" on node "${context.node.id}" must point to a definition node, but "${referencedNodeId}" has role "${referencedNode.role}".`,
      nodeId: context.node.id,
    };
  }

  const definitionReadingSpan = readingSpanLookup.get(referencedNodeId);

  if (definitionReadingSpan === undefined) {
    return {
      code: DEFINITION_FLOW_DIAGNOSTIC_CODES.missingReferenceTarget,
      severity: "error",
      message:
        `Semantic reference field "${semanticFieldId}" on node "${context.node.id}" points to missing node "${referencedNodeId}".`,
      nodeId: context.node.id,
    };
  }

  if (definitionReadingSpan.end >= usingNodeReadingSpan.start) {
    return {
      code: DEFINITION_FLOW_DIAGNOSTIC_CODES.definitionAppearsAfterUse,
      severity: "error",
      message:
        `Definition node "${referencedNodeId}" must appear before using node "${context.node.id}" in reading order.`,
      nodeId: context.node.id,
    };
  }

  return undefined;
}
