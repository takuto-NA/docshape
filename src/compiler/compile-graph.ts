/**
 * Compiles SemanticDocumentGraph instances against DocumentSchema rules.
 */

import { CORE_DIAGNOSTIC_CODES } from "../constants/diagnostic-codes.js";
import { buildCompileMetadata } from "../graph/index-builder.js";
import { isValidLayerNesting } from "../graph/layer-rules.js";
import type {
  CompileOptions,
  CompileResult,
  ConstraintEvaluationContext,
  Diagnosis,
  DocumentSchema,
  IndexedNode,
  PatchOperation,
  ResolvedLink,
  RoleLinkConstraint,
  SemanticDocumentGraph,
  TextRequiredRule,
} from "../types/domain.js";

const DEFAULT_MINIMUM_LINK_COUNT = 1;

export function compileStructural(
  graph: SemanticDocumentGraph,
  schema: DocumentSchema,
): CompileResult {
  return compileGraph(graph, schema, { mode: "structural" });
}

export function compileRenderable(
  graph: SemanticDocumentGraph,
  schema: DocumentSchema,
): CompileResult {
  return compileGraph(graph, schema, { mode: "renderable" });
}

function compileGraph(
  graph: SemanticDocumentGraph,
  schema: DocumentSchema,
  options: CompileOptions,
): CompileResult {
  const { duplicateNodeIds, metadata } = buildCompileMetadata(graph);
  const diagnoses: Diagnosis[] = [];

  appendDuplicateNodeDiagnoses(diagnoses, duplicateNodeIds);
  appendLayerNestingDiagnoses(diagnoses, metadata.nodeIndex);
  appendRoleDiagnoses(diagnoses, metadata.nodeIndex, schema);
  appendLinkTypeDiagnoses(diagnoses, metadata.nodeIndex, schema);
  appendBrokenLinkTargetDiagnoses(diagnoses, metadata.nodeIndex);
  appendDeclarativeConstraintDiagnoses(diagnoses, graph, schema, metadata);
  appendPredicateConstraintDiagnoses(diagnoses, graph, schema, metadata);

  if (options.mode === "renderable") {
    appendMissingTextDiagnoses(diagnoses, metadata.nodeIndex, schema);
  }

  return {
    isValid: diagnoses.every((diagnosis) => diagnosis.severity !== "error"),
    diagnoses,
    metadata,
  };
}

function appendDuplicateNodeDiagnoses(
  diagnoses: Diagnosis[],
  duplicateNodeIds: string[],
): void {
  for (const duplicateNodeId of duplicateNodeIds) {
    diagnoses.push({
      code: CORE_DIAGNOSTIC_CODES.duplicateNodeId,
      severity: "error",
      message: `Duplicate node id "${duplicateNodeId}" found in SemanticDocumentGraph.`,
      nodeId: duplicateNodeId,
    });
  }
}

function appendLayerNestingDiagnoses(
  diagnoses: Diagnosis[],
  nodeIndex: Map<string, IndexedNode>,
): void {
  for (const indexedNode of nodeIndex.values()) {
    const parentNode = indexedNode.parentId
      ? nodeIndex.get(indexedNode.parentId)
      : undefined;

    if (parentNode === undefined) {
      continue;
    }

    if (isValidLayerNesting(parentNode.layer, indexedNode.layer)) {
      continue;
    }

    diagnoses.push({
      code: CORE_DIAGNOSTIC_CODES.invalidLayerNesting,
      severity: "error",
      message: `Node "${indexedNode.id}" with layer "${indexedNode.layer}" cannot be nested under "${parentNode.id}" with layer "${parentNode.layer}".`,
      nodeId: indexedNode.id,
    });
  }
}

function appendRoleDiagnoses(
  diagnoses: Diagnosis[],
  nodeIndex: Map<string, IndexedNode>,
  schema: DocumentSchema,
): void {
  for (const indexedNode of nodeIndex.values()) {
    if (schema.allowedRoles.includes(indexedNode.role)) {
      continue;
    }

    diagnoses.push({
      code: CORE_DIAGNOSTIC_CODES.invalidRole,
      severity: "error",
      message: `Role "${indexedNode.role}" is not allowed by schema "${schema.name}".`,
      nodeId: indexedNode.id,
    });
  }
}

function appendLinkTypeDiagnoses(
  diagnoses: Diagnosis[],
  nodeIndex: Map<string, IndexedNode>,
  schema: DocumentSchema,
): void {
  for (const indexedNode of nodeIndex.values()) {
    for (const semanticLink of indexedNode.links) {
      if (schema.allowedLinkTypes.includes(semanticLink.type)) {
        continue;
      }

      diagnoses.push({
        code: CORE_DIAGNOSTIC_CODES.invalidLinkType,
        severity: "error",
        message: `Link type "${semanticLink.type}" is not allowed by schema "${schema.name}".`,
        nodeId: indexedNode.id,
      });
    }
  }
}

function appendBrokenLinkTargetDiagnoses(
  diagnoses: Diagnosis[],
  nodeIndex: Map<string, IndexedNode>,
): void {
  for (const indexedNode of nodeIndex.values()) {
    for (const semanticLink of indexedNode.links) {
      if (nodeIndex.has(semanticLink.targetId)) {
        continue;
      }

      diagnoses.push({
        code: CORE_DIAGNOSTIC_CODES.brokenLinkTarget,
        severity: "error",
        message: `Link from "${indexedNode.id}" targets missing node "${semanticLink.targetId}".`,
        nodeId: indexedNode.id,
      });
    }
  }
}

function appendDeclarativeConstraintDiagnoses(
  diagnoses: Diagnosis[],
  graph: SemanticDocumentGraph,
  schema: DocumentSchema,
  metadata: CompileResult["metadata"],
): void {
  if (schema.roleLinkConstraints === undefined) {
    return;
  }

  for (const indexedNode of metadata.nodeIndex.values()) {
    const matchingConstraints = schema.roleLinkConstraints.filter(
      (constraint) =>
        constraint.role === indexedNode.role &&
        (constraint.layers === undefined || constraint.layers.includes(indexedNode.layer)),
    );

    for (const roleLinkConstraint of matchingConstraints) {
      const constraintDiagnosis = evaluateRoleLinkConstraint(
        graph,
        metadata,
        indexedNode,
        roleLinkConstraint,
      );

      if (constraintDiagnosis !== undefined) {
        diagnoses.push(constraintDiagnosis);
      }
    }
  }
}

function evaluateRoleLinkConstraint(
  graph: SemanticDocumentGraph,
  metadata: CompileResult["metadata"],
  indexedNode: IndexedNode,
  roleLinkConstraint: RoleLinkConstraint,
): Diagnosis | undefined {
  const incomingLinks = metadata.incomingLinksByNodeId.get(indexedNode.id) ?? [];
  const outgoingLinks = metadata.outgoingLinksByNodeId.get(indexedNode.id) ?? [];

  const allRequirementsSatisfied = roleLinkConstraint.requirements.every((requirement) => {
    const candidateLinks = requirement.direction === "incoming" ? incomingLinks : outgoingLinks;
    const matchingLinkCount = countMatchingLinks(candidateLinks, requirement, indexedNode.id);

    const minimumCount = requirement.minimumCount ?? DEFAULT_MINIMUM_LINK_COUNT;
    return matchingLinkCount >= minimumCount;
  });

  if (allRequirementsSatisfied) {
    return undefined;
  }

  return {
    code: roleLinkConstraint.diagnosticCode,
    severity: roleLinkConstraint.severity ?? "error",
    message: roleLinkConstraint.message,
    nodeId: indexedNode.id,
    suggestedOperations: buildSuggestedOperations(indexedNode, roleLinkConstraint),
  };
}

function countMatchingLinks(
  candidateLinks: ResolvedLink[],
  requirement: RoleLinkConstraint["requirements"][number],
  nodeId: string,
): number {
  return candidateLinks.filter((resolvedLink) => {
    if (!requirement.linkTypes.includes(resolvedLink.linkType)) {
      return false;
    }

    if (requirement.peerRoles === undefined) {
      return true;
    }

    const peerRole =
      requirement.direction === "incoming" ? resolvedLink.sourceRole : resolvedLink.targetRole;

    if (!requirement.peerRoles.includes(peerRole)) {
      return false;
    }

    return resolvedLink.sourceId === nodeId || resolvedLink.targetId === nodeId;
  }).length;
}

function buildSuggestedOperations(
  indexedNode: IndexedNode,
  roleLinkConstraint: RoleLinkConstraint,
): PatchOperation[] {
  const suggestedOperations: PatchOperation[] = [];

  if (roleLinkConstraint.suggestInsertParagraph !== undefined) {
    suggestedOperations.push({
      type: "insert_paragraph",
      id: `${indexedNode.id}-suggested-paragraph`,
      role: roleLinkConstraint.suggestInsertParagraph.role,
      reason: roleLinkConstraint.suggestInsertParagraph.reason,
    });
  }

  if (roleLinkConstraint.suggestAddLink !== undefined) {
    suggestedOperations.push({
      type: "add_link",
      from: indexedNode.id,
      to: `${indexedNode.id}-suggested-target`,
      link: roleLinkConstraint.suggestAddLink.linkType,
    });
  }

  return suggestedOperations;
}

function appendPredicateConstraintDiagnoses(
  diagnoses: Diagnosis[],
  graph: SemanticDocumentGraph,
  schema: DocumentSchema,
  metadata: CompileResult["metadata"],
): void {
  if (schema.predicateConstraints === undefined) {
    return;
  }

  for (const indexedNode of metadata.nodeIndex.values()) {
    for (const predicateConstraint of schema.predicateConstraints) {
      const evaluationContext: ConstraintEvaluationContext = {
        node: indexedNode,
        graph,
        nodeIndex: metadata.nodeIndex,
        incomingLinks: metadata.incomingLinksByNodeId.get(indexedNode.id) ?? [],
        outgoingLinks: metadata.outgoingLinksByNodeId.get(indexedNode.id) ?? [],
      };

      diagnoses.push(...predicateConstraint.evaluate(evaluationContext));
    }
  }
}

function appendMissingTextDiagnoses(
  diagnoses: Diagnosis[],
  nodeIndex: Map<string, IndexedNode>,
  schema: DocumentSchema,
): void {
  const textRequiredRules = schema.textRequiredRules ?? [];

  for (const indexedNode of nodeIndex.values()) {
    if (!isTextRequiredForNode(indexedNode, textRequiredRules)) {
      continue;
    }

    if (indexedNode.text.trim().length > 0) {
      continue;
    }

    diagnoses.push({
      code: CORE_DIAGNOSTIC_CODES.missingRequiredText,
      severity: "error",
      message: `Node "${indexedNode.id}" with role "${indexedNode.role}" requires text before rendering.`,
      nodeId: indexedNode.id,
    });
  }
}

function isTextRequiredForNode(
  indexedNode: IndexedNode,
  textRequiredRules: TextRequiredRule[],
): boolean {
  for (const textRequiredRule of textRequiredRules) {
    if (!textRequiredRule.layers.includes(indexedNode.layer)) {
      continue;
    }

    if (textRequiredRule.roles === undefined) {
      return true;
    }

    if (textRequiredRule.roles.includes(indexedNode.role)) {
      return true;
    }
  }

  return false;
}
