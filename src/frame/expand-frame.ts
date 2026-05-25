/**
 * Expands a FrameInstance into a SemanticDocumentGraph.
 */

import { createSemanticDocumentNode, defineSemanticDocumentGraph } from "../helpers/define-graph.js";
import type { SemanticDocumentNode, SemanticLink, SemanticValue } from "../types/domain.js";
import type {
  DocumentFrame,
  FrameExpansionResult,
  FrameInstance,
  ParagraphPatternResolutionResult,
  ResolvedParagraphPattern,
  SentencePattern,
} from "../types/frame.js";
import {
  buildLogicalSectionId,
  buildLogicalSentenceId,
  buildSentenceReferenceKey,
  createFrameInstanceKey,
  generateDocumentNodeId,
  generateParagraphNodeId,
  generateSentenceNodeId,
  resolveNodeId,
} from "./id-generator.js";
import {
  getIncludedParagraphPatterns,
  resolveParagraphPatterns,
} from "./resolve-paragraph-patterns.js";

export function expandFrameInstance(
  frame: DocumentFrame,
  instance: FrameInstance,
  patternResolution?: ParagraphPatternResolutionResult,
): FrameExpansionResult {
  const resolvedPatternResolution =
    patternResolution ?? resolveParagraphPatterns(frame, instance);
  const includedParagraphPatterns = getIncludedParagraphPatterns(
    resolvedPatternResolution.resolvedParagraphPatterns,
  );
  const instanceKey = createFrameInstanceKey(instance.title);
  const idOverrides = instance.idOverrides ?? {};
  const sentenceReferenceIdLookup = buildSentenceReferenceIdLookup(
    frame.frameId,
    instanceKey,
    includedParagraphPatterns,
    idOverrides,
  );
  const sectionIdLookup = buildSectionIdLookup(frame, instanceKey, idOverrides);
  const sectionNodes = buildSectionNodes(
    frame,
    instanceKey,
    includedParagraphPatterns,
    idOverrides,
    sentenceReferenceIdLookup,
  );
  const documentNode = createSemanticDocumentNode({
    id: resolveNodeId(
      frame.frameId,
      instanceKey,
      generateDocumentNodeId(frame.frameId, instanceKey),
      idOverrides,
    ),
    layer: "document",
    role: "document",
    text: "",
    links: [],
    children: sectionNodes,
  });

  attachLinkTemplates(documentNode, frame, sentenceReferenceIdLookup, sectionIdLookup);

  return {
    graph: defineSemanticDocumentGraph(documentNode),
    expansionDiagnoses: resolvedPatternResolution.diagnoses,
  };
}

function buildSectionIdLookup(
  frame: DocumentFrame,
  instanceKey: string,
  idOverrides: Record<string, string>,
): Map<string, string> {
  const sectionIdLookup = new Map<string, string>();

  for (const sectionDefinition of frame.sections) {
    const logicalSectionId = buildLogicalSectionId(
      frame.frameId,
      instanceKey,
      sectionDefinition.sectionId,
    );
    sectionIdLookup.set(
      sectionDefinition.sectionId,
      resolveNodeId(frame.frameId, instanceKey, logicalSectionId, idOverrides),
    );
  }

  return sectionIdLookup;
}

function buildSentenceReferenceIdLookup(
  frameId: string,
  instanceKey: string,
  includedParagraphPatterns: ResolvedParagraphPattern[],
  idOverrides: Record<string, string>,
): Map<string, string> {
  const sentenceReferenceIdLookup = new Map<string, string>();

  for (const resolvedParagraphPattern of includedParagraphPatterns) {
    const paragraphId = resolvedParagraphPattern.patternDefinition.paragraphId;

    for (const sentencePattern of resolvedParagraphPattern.patternDefinition.sentences) {
      const logicalSentenceId = buildLogicalSentenceId(
        frameId,
        instanceKey,
        paragraphId,
        sentencePattern.sentenceId,
      );
      sentenceReferenceIdLookup.set(
        buildSentenceReferenceKey(paragraphId, sentencePattern.sentenceId),
        resolveNodeId(frameId, instanceKey, logicalSentenceId, idOverrides),
      );
    }
  }

  return sentenceReferenceIdLookup;
}

function buildSectionNodes(
  frame: DocumentFrame,
  instanceKey: string,
  includedParagraphPatterns: ResolvedParagraphPattern[],
  idOverrides: Record<string, string>,
  sentenceReferenceIdLookup: Map<string, string>,
): SemanticDocumentNode[] {
  const paragraphPatternsBySectionId = groupParagraphPatternsBySection(includedParagraphPatterns);

  return frame.sections
    .map((sectionDefinition) => {
      const sectionParagraphPatterns =
        paragraphPatternsBySectionId.get(sectionDefinition.sectionId) ?? [];

      if (sectionParagraphPatterns.length === 0) {
        return undefined;
      }

      const logicalSectionId = buildLogicalSectionId(
        frame.frameId,
        instanceKey,
        sectionDefinition.sectionId,
      );

      return createSemanticDocumentNode({
        id: resolveNodeId(frame.frameId, instanceKey, logicalSectionId, idOverrides),
        layer: "section",
        role: sectionDefinition.role,
        text: sectionDefinition.title,
        links: [],
        children: sectionParagraphPatterns.map((resolvedParagraphPattern) =>
          buildParagraphNode(
            frame.frameId,
            instanceKey,
            resolvedParagraphPattern,
            idOverrides,
            sentenceReferenceIdLookup,
          ),
        ),
      });
    })
    .filter((sectionNode): sectionNode is SemanticDocumentNode => sectionNode !== undefined);
}

function groupParagraphPatternsBySection(
  includedParagraphPatterns: ResolvedParagraphPattern[],
): Map<string, ResolvedParagraphPattern[]> {
  const paragraphPatternsBySectionId = new Map<string, ResolvedParagraphPattern[]>();

  for (const resolvedParagraphPattern of includedParagraphPatterns) {
    const sectionId = resolvedParagraphPattern.patternDefinition.sectionId;
    const existingParagraphPatterns = paragraphPatternsBySectionId.get(sectionId) ?? [];
    existingParagraphPatterns.push(resolvedParagraphPattern);
    paragraphPatternsBySectionId.set(sectionId, existingParagraphPatterns);
  }

  return paragraphPatternsBySectionId;
}

function buildParagraphNode(
  frameId: string,
  instanceKey: string,
  resolvedParagraphPattern: ResolvedParagraphPattern,
  idOverrides: Record<string, string>,
  sentenceReferenceIdLookup: Map<string, string>,
): SemanticDocumentNode {
  const paragraphId = resolvedParagraphPattern.patternDefinition.paragraphId;
  const paragraphLogicalId = generateParagraphNodeId(frameId, instanceKey, paragraphId);
  const paragraphRole =
    resolvedParagraphPattern.patternDefinition.paragraphRole ??
    resolvedParagraphPattern.patternDefinition.sentences[0]?.role ??
    "background";

  return createSemanticDocumentNode({
    id: resolveNodeId(frameId, instanceKey, paragraphLogicalId, idOverrides),
    layer: "paragraph",
    role: paragraphRole,
    text: "",
    links: [],
    children: resolvedParagraphPattern.patternDefinition.sentences.map((sentencePattern) =>
      buildSentenceNode(
        frameId,
        instanceKey,
        paragraphId,
        sentencePattern,
        resolvedParagraphPattern,
        idOverrides,
        sentenceReferenceIdLookup,
      ),
    ),
  });
}

function buildSentenceNode(
  frameId: string,
  instanceKey: string,
  paragraphId: string,
  sentencePattern: SentencePattern,
  resolvedParagraphPattern: ResolvedParagraphPattern,
  idOverrides: Record<string, string>,
  sentenceReferenceIdLookup: Map<string, string>,
): SemanticDocumentNode {
  const sentenceLogicalId = generateSentenceNodeId(
    frameId,
    instanceKey,
    paragraphId,
    sentencePattern.sentenceId,
  );
  const proseText =
    resolvedParagraphPattern.proseFill[sentencePattern.sentenceId]?.trim() ?? "";

  return createSemanticDocumentNode({
    id: resolveNodeId(frameId, instanceKey, sentenceLogicalId, idOverrides),
    layer: "sentence",
    role: sentencePattern.role,
    text: proseText,
    semanticPayload: buildSentenceSemanticPayload(
      sentencePattern,
      resolvedParagraphPattern.semanticFill,
      sentenceReferenceIdLookup,
    ),
    links: [],
  });
}

function buildSentenceSemanticPayload(
  sentencePattern: SentencePattern,
  semanticFill: Record<string, SemanticValue>,
  sentenceReferenceIdLookup: Map<string, string>,
): Record<string, SemanticValue> {
  const sentenceSemanticPayload: Record<string, SemanticValue> = {};

  for (const semanticFieldId of sentencePattern.requiredSemanticFieldIds) {
    const semanticValue = semanticFill[semanticFieldId];

    if (semanticValue === undefined) {
      continue;
    }

    sentenceSemanticPayload[semanticFieldId] = resolveFrameLocalReferenceValue(
      semanticValue,
      sentenceReferenceIdLookup,
    );
  }

  return sentenceSemanticPayload;
}

function resolveFrameLocalReferenceValue(
  semanticValue: SemanticValue,
  sentenceReferenceIdLookup: Map<string, string>,
): SemanticValue {
  if (semanticValue.kind !== "reference") {
    return semanticValue;
  }

  if (!semanticValue.value.includes("::")) {
    return semanticValue;
  }

  const resolvedNodeId = sentenceReferenceIdLookup.get(semanticValue.value);

  if (resolvedNodeId === undefined) {
    return semanticValue;
  }

  return {
    kind: "reference",
    value: resolvedNodeId,
  };
}

function attachLinkTemplates(
  documentNode: SemanticDocumentNode,
  frame: DocumentFrame,
  sentenceReferenceIdLookup: Map<string, string>,
  sectionIdLookup: Map<string, string>,
): void {
  const nodeIndex = indexNodesById(documentNode);

  for (const linkTemplate of frame.linkTemplates) {
    const sourceReferenceKey = buildSentenceReferenceKey(
      linkTemplate.sourceParagraphId,
      linkTemplate.sourceSentenceId,
    );
    const sourceNodeId = sentenceReferenceIdLookup.get(sourceReferenceKey);

    if (sourceNodeId === undefined) {
      continue;
    }

    const sourceNode = nodeIndex.get(sourceNodeId);

    if (sourceNode === undefined) {
      continue;
    }

    const targetNodeId = resolveLinkTargetId(
      linkTemplate,
      sentenceReferenceIdLookup,
      sectionIdLookup,
    );

    if (targetNodeId === undefined) {
      continue;
    }

    const semanticLink: SemanticLink = {
      type: linkTemplate.linkType,
      targetId: targetNodeId,
    };
    sourceNode.links.push(semanticLink);
  }
}

function resolveLinkTargetId(
  linkTemplate: DocumentFrame["linkTemplates"][number],
  sentenceReferenceIdLookup: Map<string, string>,
  sectionIdLookup: Map<string, string>,
): string | undefined {
  if (
    linkTemplate.targetParagraphId !== undefined &&
    linkTemplate.targetSentenceId !== undefined
  ) {
    return sentenceReferenceIdLookup.get(
      buildSentenceReferenceKey(
        linkTemplate.targetParagraphId,
        linkTemplate.targetSentenceId,
      ),
    );
  }

  if (linkTemplate.targetSectionId !== undefined) {
    return sectionIdLookup.get(linkTemplate.targetSectionId);
  }

  return undefined;
}

function indexNodesById(rootNode: SemanticDocumentNode): Map<string, SemanticDocumentNode> {
  const nodeIndex = new Map<string, SemanticDocumentNode>();

  function visitNode(node: SemanticDocumentNode): void {
    nodeIndex.set(node.id, node);

    for (const childNode of node.children ?? []) {
      visitNode(childNode);
    }
  }

  visitNode(rootNode);
  return nodeIndex;
}
