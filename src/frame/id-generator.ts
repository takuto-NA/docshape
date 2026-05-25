/**
 * Builds deterministic node ids for DocumentFrame expansion.
 */

const INSTANCE_KEY_PATTERN = /[^a-z0-9]+/g;

export function createFrameInstanceKey(title: string): string {
  const normalizedTitle = title.trim().toLowerCase().replace(INSTANCE_KEY_PATTERN, "-");
  const trimmedKey = normalizedTitle.replace(/^-+|-+$/g, "");

  if (trimmedKey.length === 0) {
    return "untitled";
  }

  return trimmedKey;
}

export function generateFrameNodeId(
  frameId: string,
  instanceKey: string,
  nodeParts: readonly string[],
): string {
  return [frameId, instanceKey, ...nodeParts].join(".");
}

export function generateSlotNodeId(
  frameId: string,
  instanceKey: string,
  slotId: string,
  layer: "paragraph" | "sentence",
  sentenceIndex?: number,
): string {
  if (layer === "paragraph") {
    return generateFrameNodeId(frameId, instanceKey, [slotId, "paragraph"]);
  }

  if (sentenceIndex === undefined) {
    return generateFrameNodeId(frameId, instanceKey, [slotId, "sentence"]);
  }

  return generateFrameNodeId(frameId, instanceKey, [slotId, "sentence", String(sentenceIndex)]);
}

export function generateSectionNodeId(
  frameId: string,
  instanceKey: string,
  sectionId: string,
): string {
  return generateFrameNodeId(frameId, instanceKey, [sectionId, "section"]);
}

export function generateDocumentNodeId(frameId: string, instanceKey: string): string {
  return generateFrameNodeId(frameId, instanceKey, ["document"]);
}

export function resolveNodeId(
  frameId: string,
  instanceKey: string,
  logicalId: string,
  idOverrides: Record<string, string> | undefined,
): string {
  if (idOverrides !== undefined && idOverrides[logicalId] !== undefined) {
    return idOverrides[logicalId];
  }

  return logicalId;
}

export function buildLogicalSlotSentenceId(
  frameId: string,
  instanceKey: string,
  slotId: string,
  sentenceIndex?: number,
): string {
  if (sentenceIndex === undefined) {
    return generateSlotNodeId(frameId, instanceKey, slotId, "sentence");
  }

  return generateSlotNodeId(frameId, instanceKey, slotId, "sentence", sentenceIndex);
}

export function buildLogicalSectionId(
  frameId: string,
  instanceKey: string,
  sectionId: string,
): string {
  return generateSectionNodeId(frameId, instanceKey, sectionId);
}
