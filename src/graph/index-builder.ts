/**
 * Builds flat indexes and link lookups from a SemanticDocumentGraph tree.
 */

import type {
  CompileMetadata,
  IndexedNode,
  ResolvedLink,
  SemanticDocumentGraph,
  SemanticDocumentNode,
} from "../types/domain.js";

export interface IndexBuildResult {
  metadata: CompileMetadata;
  duplicateNodeIds: string[];
}

export function buildCompileMetadata(graph: SemanticDocumentGraph): IndexBuildResult {
  const nodeIndex = new Map<string, IndexedNode>();
  const parentLookup = new Map<string, string | null>();
  const incomingLinksByNodeId = new Map<string, ResolvedLink[]>();
  const outgoingLinksByNodeId = new Map<string, ResolvedLink[]>();
  const duplicateNodeIds: string[] = [];

  indexNodeTree(graph.root, null, nodeIndex, parentLookup, duplicateNodeIds);
  buildLinkLookups(nodeIndex, incomingLinksByNodeId, outgoingLinksByNodeId);

  return {
    duplicateNodeIds,
    metadata: {
      nodeIndex,
      parentLookup,
      incomingLinksByNodeId,
      outgoingLinksByNodeId,
    },
  };
}

function indexNodeTree(
  node: SemanticDocumentNode,
  parentId: string | null,
  nodeIndex: Map<string, IndexedNode>,
  parentLookup: Map<string, string | null>,
  duplicateNodeIds: string[],
): void {
  if (nodeIndex.has(node.id)) {
    duplicateNodeIds.push(node.id);
  } else {
    const indexedNode: IndexedNode = {
      id: node.id,
      layer: node.layer,
      role: node.role,
      text: node.text,
      parentId,
      children: node.children ?? [],
      links: node.links,
      node,
    };

    nodeIndex.set(node.id, indexedNode);
    parentLookup.set(node.id, parentId);
  }

  for (const childNode of node.children ?? []) {
    indexNodeTree(childNode, node.id, nodeIndex, parentLookup, duplicateNodeIds);
  }
}

function buildLinkLookups(
  nodeIndex: Map<string, IndexedNode>,
  incomingLinksByNodeId: Map<string, ResolvedLink[]>,
  outgoingLinksByNodeId: Map<string, ResolvedLink[]>,
): void {
  for (const sourceNode of nodeIndex.values()) {
    for (const semanticLink of sourceNode.links) {
      const targetNode = nodeIndex.get(semanticLink.targetId);

      const resolvedLink: ResolvedLink = {
        linkType: semanticLink.type,
        sourceId: sourceNode.id,
        targetId: semanticLink.targetId,
        sourceRole: sourceNode.role,
        targetRole: targetNode?.role ?? "",
      };

      appendResolvedLink(outgoingLinksByNodeId, sourceNode.id, resolvedLink);

      if (targetNode !== undefined) {
        appendResolvedLink(incomingLinksByNodeId, targetNode.id, resolvedLink);
      }
    }
  }
}

function appendResolvedLink(
  lookup: Map<string, ResolvedLink[]>,
  nodeId: string,
  resolvedLink: ResolvedLink,
): void {
  const existingLinks = lookup.get(nodeId) ?? [];
  existingLinks.push(resolvedLink);
  lookup.set(nodeId, existingLinks);
}
