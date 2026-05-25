/**
 * Stable diagnostic codes emitted by the DocumentFrame layer.
 */

export const FRAME_DIAGNOSTIC_CODES = {
  missingRequiredSlotFill: "FRAME-REQ-001",
  slotDeviated: "FRAME-DEV-001",
  unknownSlotFill: "FRAME-FILL-001",
  unknownDeviation: "FRAME-DEV-002",
  frameIdMismatch: "FRAME-MISMATCH-001",
  missingDeviationReason: "FRAME-DEV-003",
} as const;
