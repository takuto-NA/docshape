/**
 * Allowed parent-child layer relationships in the SemanticDocumentGraph tree.
 */

import type { DocumentLayer } from "../types/domain.js";

const ALLOWED_CHILD_LAYERS_BY_PARENT_LAYER: Record<DocumentLayer, readonly DocumentLayer[]> = {
  document: ["section"],
  section: ["section", "paragraph"],
  paragraph: ["sentence"],
  sentence: [],
};

export function getAllowedChildLayers(parentLayer: DocumentLayer): readonly DocumentLayer[] {
  return ALLOWED_CHILD_LAYERS_BY_PARENT_LAYER[parentLayer];
}

export function isValidLayerNesting(
  parentLayer: DocumentLayer,
  childLayer: DocumentLayer,
): boolean {
  return getAllowedChildLayers(parentLayer).includes(childLayer);
}
