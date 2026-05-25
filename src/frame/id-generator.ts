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

export function generateParagraphNodeId(
  frameId: string,
  instanceKey: string,
  paragraphId: string,
): string {
  return generateFrameNodeId(frameId, instanceKey, [paragraphId, "paragraph"]);
}

export function generateSentenceNodeId(
  frameId: string,
  instanceKey: string,
  paragraphId: string,
  sentenceId: string,
): string {
  return generateFrameNodeId(frameId, instanceKey, [paragraphId, "sentence", sentenceId]);
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

export function buildLogicalParagraphId(
  frameId: string,
  instanceKey: string,
  paragraphId: string,
): string {
  return generateParagraphNodeId(frameId, instanceKey, paragraphId);
}

export function buildLogicalSentenceId(
  frameId: string,
  instanceKey: string,
  paragraphId: string,
  sentenceId: string,
): string {
  return generateSentenceNodeId(frameId, instanceKey, paragraphId, sentenceId);
}

export function buildLogicalSectionId(
  frameId: string,
  instanceKey: string,
  sectionId: string,
): string {
  return generateSectionNodeId(frameId, instanceKey, sectionId);
}

export function buildSentenceReferenceKey(paragraphId: string, sentenceId: string): string {
  return `${paragraphId}::${sentenceId}`;
}

export function parseSentenceReferenceKey(referenceKey: string): {
  paragraphId: string;
  sentenceId: string;
} {
  const separatorIndex = referenceKey.indexOf("::");

  if (separatorIndex === -1) {
    return {
      paragraphId: referenceKey,
      sentenceId: referenceKey,
    };
  }

  return {
    paragraphId: referenceKey.slice(0, separatorIndex),
    sentenceId: referenceKey.slice(separatorIndex + 2),
  };
}
