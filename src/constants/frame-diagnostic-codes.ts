/**
 * Stable diagnostic codes emitted by the DocumentFrame layer.
 */

export const FRAME_DIAGNOSTIC_CODES = {
  missingRequiredSemanticField: "FRAME-SEM-001",
  unknownSemanticField: "FRAME-SEM-002",
  semanticValueKindMismatch: "FRAME-SEM-003",
  missingRequiredSentenceProse: "FRAME-PROSE-001",
  unknownProseSentenceId: "FRAME-PROSE-002",
  paragraphDeviated: "FRAME-DEV-001",
  unknownSemanticFillParagraph: "FRAME-FILL-001",
  unknownDeviation: "FRAME-DEV-002",
  frameIdMismatch: "FRAME-MISMATCH-001",
  missingDeviationReason: "FRAME-DEV-003",
} as const;
