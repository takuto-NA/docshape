/**
 * Helper functions for authoring SemanticDocumentGraph object DSL values.
 */

import type { DocumentSchema, SemanticDocumentGraph, SemanticDocumentNode } from "../types/domain.js";

export function defineSemanticDocumentGraph(
  root: SemanticDocumentNode,
): SemanticDocumentGraph {
  return { root };
}

export function defineDocumentSchema(schema: DocumentSchema): DocumentSchema {
  return schema;
}

export function createSemanticDocumentNode(
  node: SemanticDocumentNode,
): SemanticDocumentNode {
  return {
    ...node,
    children: node.children ?? [],
    links: node.links ?? [],
  };
}
