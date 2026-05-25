/**
 * Expands a FrameInstance into a SemanticDocumentGraph.
 */

import { createSemanticDocumentNode, defineSemanticDocumentGraph } from "../helpers/define-graph.js";
import type { SemanticDocumentNode, SemanticLink } from "../types/domain.js";
import type {
  DocumentFrame,
  FrameExpansionResult,
  FrameInstance,
  ResolvedFrameSlot,
} from "../types/frame.js";
import {
  buildLogicalSectionId,
  buildLogicalSlotSentenceId,
  createFrameInstanceKey,
  generateDocumentNodeId,
  generateSectionNodeId,
  generateSlotNodeId,
  resolveNodeId,
} from "./id-generator.js";
import { getIncludedSlots, resolveFrameSlots } from "./resolve-slots.js";

export function expandFrameInstance(
  frame: DocumentFrame,
  instance: FrameInstance,
): FrameExpansionResult {
  const slotResolution = resolveFrameSlots(frame, instance);
  const includedSlots = getIncludedSlots(slotResolution.resolvedSlots);
  const instanceKey = createFrameInstanceKey(instance.title);
  const idOverrides = instance.idOverrides ?? {};
  const slotSentenceIdLookup = buildSlotSentenceIdLookup(
    frame.frameId,
    instanceKey,
    includedSlots,
    idOverrides,
  );
  const sectionIdLookup = buildSectionIdLookup(frame, instanceKey, idOverrides);
  const sectionNodes = buildSectionNodes(
    frame,
    instanceKey,
    includedSlots,
    idOverrides,
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

  attachDefaultLinks(documentNode, frame, slotSentenceIdLookup, sectionIdLookup);

  return {
    graph: defineSemanticDocumentGraph(documentNode),
    expansionDiagnoses: slotResolution.diagnoses,
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

function buildSlotSentenceIdLookup(
  frameId: string,
  instanceKey: string,
  includedSlots: ResolvedFrameSlot[],
  idOverrides: Record<string, string>,
): Map<string, string> {
  const slotSentenceIdLookup = new Map<string, string>();

  for (const resolvedSlot of includedSlots) {
    const sentenceTexts = splitSlotText(resolvedSlot);
    const primarySentenceIndex = sentenceTexts.length > 1 ? 0 : undefined;
    const logicalSentenceId = buildLogicalSlotSentenceId(
      frameId,
      instanceKey,
      resolvedSlot.slotDefinition.slotId,
      primarySentenceIndex,
    );
    slotSentenceIdLookup.set(
      resolvedSlot.slotDefinition.slotId,
      resolveNodeId(frameId, instanceKey, logicalSentenceId, idOverrides),
    );
  }

  return slotSentenceIdLookup;
}

function buildSectionNodes(
  frame: DocumentFrame,
  instanceKey: string,
  includedSlots: ResolvedFrameSlot[],
  idOverrides: Record<string, string>,
): SemanticDocumentNode[] {
  const slotsBySectionId = groupSlotsBySection(includedSlots);

  return frame.sections
    .map((sectionDefinition) => {
      const sectionSlots = slotsBySectionId.get(sectionDefinition.sectionId) ?? [];

      if (sectionSlots.length === 0) {
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
        children: sectionSlots.map((resolvedSlot) =>
          buildParagraphNode(frame.frameId, instanceKey, resolvedSlot, idOverrides),
        ),
      });
    })
    .filter((sectionNode): sectionNode is SemanticDocumentNode => sectionNode !== undefined);
}

function groupSlotsBySection(
  includedSlots: ResolvedFrameSlot[],
): Map<string, ResolvedFrameSlot[]> {
  const slotsBySectionId = new Map<string, ResolvedFrameSlot[]>();

  for (const resolvedSlot of includedSlots) {
    const sectionId = resolvedSlot.slotDefinition.sectionId;
    const existingSlots = slotsBySectionId.get(sectionId) ?? [];
    existingSlots.push(resolvedSlot);
    slotsBySectionId.set(sectionId, existingSlots);
  }

  return slotsBySectionId;
}

function buildParagraphNode(
  frameId: string,
  instanceKey: string,
  resolvedSlot: ResolvedFrameSlot,
  idOverrides: Record<string, string>,
): SemanticDocumentNode {
  const slotId = resolvedSlot.slotDefinition.slotId;
  const paragraphLogicalId = generateSlotNodeId(frameId, instanceKey, slotId, "paragraph");
  const sentenceTexts = splitSlotText(resolvedSlot);

  return createSemanticDocumentNode({
    id: resolveNodeId(frameId, instanceKey, paragraphLogicalId, idOverrides),
    layer: "paragraph",
    role: resolvedSlot.slotDefinition.role,
    text: "",
    links: [],
    children: sentenceTexts.map((sentenceText, sentenceIndex) => {
      const sentenceLogicalId =
        sentenceTexts.length > 1
          ? generateSlotNodeId(frameId, instanceKey, slotId, "sentence", sentenceIndex)
          : generateSlotNodeId(frameId, instanceKey, slotId, "sentence");

      return createSemanticDocumentNode({
        id: resolveNodeId(frameId, instanceKey, sentenceLogicalId, idOverrides),
        layer: "sentence",
        role: resolvedSlot.slotDefinition.role,
        text: sentenceText,
        links: [],
      });
    }),
  });
}

function splitSlotText(resolvedSlot: ResolvedFrameSlot): string[] {
  if (!resolvedSlot.slotDefinition.multiSentence) {
    return [resolvedSlot.text];
  }

  return resolvedSlot.text
    .split("\n")
    .map((sentenceText) => sentenceText.trim())
    .filter((sentenceText) => sentenceText.length > 0);
}

function attachDefaultLinks(
  documentNode: SemanticDocumentNode,
  frame: DocumentFrame,
  slotSentenceIdLookup: Map<string, string>,
  sectionIdLookup: Map<string, string>,
): void {
  const nodeIndex = indexNodesById(documentNode);

  for (const linkTemplate of frame.linkTemplates) {
    const sourceNodeId = slotSentenceIdLookup.get(linkTemplate.sourceSlotId);

    if (sourceNodeId === undefined) {
      continue;
    }

    const sourceNode = nodeIndex.get(sourceNodeId);

    if (sourceNode === undefined) {
      continue;
    }

    const targetNodeId = resolveLinkTargetId(linkTemplate, slotSentenceIdLookup, sectionIdLookup);

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
  slotSentenceIdLookup: Map<string, string>,
  sectionIdLookup: Map<string, string>,
): string | undefined {
  if (linkTemplate.targetSlotId !== undefined) {
    return slotSentenceIdLookup.get(linkTemplate.targetSlotId);
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
