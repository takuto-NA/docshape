/**
 * Stable diagnostic codes emitted by the core compiler.
 */

export const CORE_DIAGNOSTIC_CODES = {
  duplicateNodeId: "DS-DUP-001",
  invalidLayerNesting: "DS-LAY-001",
  invalidRole: "DS-ROLE-001",
  invalidLinkType: "DS-LINK-001",
  brokenLinkTarget: "DS-LINK-002",
  missingRequiredText: "DS-TEXT-001",
} as const;
