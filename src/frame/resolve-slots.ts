/**
 * Resolves which frame slots are included, omitted, or deviated for expansion.
 */

import { FRAME_DIAGNOSTIC_CODES } from "../constants/frame-diagnostic-codes.js";
import type { Diagnosis } from "../types/domain.js";
import type {
  DocumentFrame,
  FrameInstance,
  FrameSlotDefinition,
  ResolvedFrameSlot,
} from "../types/frame.js";

export interface SlotResolutionResult {
  resolvedSlots: ResolvedFrameSlot[];
  diagnoses: Diagnosis[];
}

export function resolveFrameSlots(
  frame: DocumentFrame,
  instance: FrameInstance,
): SlotResolutionResult {
  const diagnoses: Diagnosis[] = [];
  const deviationBySlotId = buildDeviationLookup(instance);
  const resolvedSlots: ResolvedFrameSlot[] = [];

  validateUnknownFills(frame, instance, diagnoses);
  validateUnknownDeviations(frame, instance, diagnoses);
  validateFrameIdMatch(frame, instance, diagnoses);
  validateDeviationReasons(instance, diagnoses);

  for (const slotDefinition of frame.slots) {
    const deviation = deviationBySlotId.get(slotDefinition.slotId);
    const fillText = instance.fills[slotDefinition.slotId]?.trim() ?? "";
    const defaultText = slotDefinition.defaultText?.trim() ?? "";
    const resolvedText = fillText.length > 0 ? fillText : defaultText;

    if (deviation !== undefined) {
      diagnoses.push({
        code: FRAME_DIAGNOSTIC_CODES.slotDeviated,
        severity: "info",
        message: `Slot "${slotDefinition.slotId}" was omitted from the frame: ${deviation.reason}`,
        nodeId: slotDefinition.slotId,
      });
      resolvedSlots.push({
        slotDefinition,
        text: "",
        isDeviated: true,
        deviationReason: deviation.reason,
      });
      continue;
    }

    if (slotDefinition.requirement === "optional" && resolvedText.length === 0) {
      continue;
    }

    if (slotDefinition.requirement === "required" && resolvedText.length === 0) {
      diagnoses.push({
        code: FRAME_DIAGNOSTIC_CODES.missingRequiredSlotFill,
        severity: "error",
        message: `Required slot "${slotDefinition.slotId}" has no fill text.`,
        nodeId: slotDefinition.slotId,
      });
      continue;
    }

    resolvedSlots.push({
      slotDefinition,
      text: resolvedText,
      isDeviated: false,
    });
  }

  return { resolvedSlots, diagnoses };
}

function buildDeviationLookup(instance: FrameInstance): Map<string, { reason: string }> {
  const deviationLookup = new Map<string, { reason: string }>();

  for (const deviation of instance.deviations ?? []) {
    deviationLookup.set(deviation.slotId, { reason: deviation.reason });
  }

  return deviationLookup;
}

function validateUnknownFills(
  frame: DocumentFrame,
  instance: FrameInstance,
  diagnoses: Diagnosis[],
): void {
  const knownSlotIds = new Set(frame.slots.map((slotDefinition) => slotDefinition.slotId));

  for (const fillSlotId of Object.keys(instance.fills)) {
    if (knownSlotIds.has(fillSlotId)) {
      continue;
    }

    diagnoses.push({
      code: FRAME_DIAGNOSTIC_CODES.unknownSlotFill,
      severity: "warning",
      message: `Fill key "${fillSlotId}" does not match any slot in frame "${frame.frameId}".`,
      nodeId: fillSlotId,
    });
  }
}

function validateFrameIdMatch(
  frame: DocumentFrame,
  instance: FrameInstance,
  diagnoses: Diagnosis[],
): void {
  if (instance.frameId === frame.frameId) {
    return;
  }

  diagnoses.push({
    code: FRAME_DIAGNOSTIC_CODES.frameIdMismatch,
    severity: "error",
    message: `Frame instance "${instance.frameId}" does not match frame definition "${frame.frameId}".`,
    nodeId: instance.frameId,
  });
}

function validateDeviationReasons(instance: FrameInstance, diagnoses: Diagnosis[]): void {
  for (const deviation of instance.deviations ?? []) {
    if (deviation.reason.trim().length > 0) {
      continue;
    }

    diagnoses.push({
      code: FRAME_DIAGNOSTIC_CODES.missingDeviationReason,
      severity: "error",
      message: `Deviation for slot "${deviation.slotId}" requires a non-empty reason.`,
      nodeId: deviation.slotId,
    });
  }
}

function validateUnknownDeviations(
  frame: DocumentFrame,
  instance: FrameInstance,
  diagnoses: Diagnosis[],
): void {
  const knownSlotIds = new Set(frame.slots.map((slotDefinition) => slotDefinition.slotId));

  for (const deviation of instance.deviations ?? []) {
    if (knownSlotIds.has(deviation.slotId)) {
      continue;
    }

    diagnoses.push({
      code: FRAME_DIAGNOSTIC_CODES.unknownDeviation,
      severity: "warning",
      message: `Deviation slot "${deviation.slotId}" does not match any slot in frame "${frame.frameId}".`,
      nodeId: deviation.slotId,
    });
  }
}

export function getIncludedSlots(resolvedSlots: ResolvedFrameSlot[]): ResolvedFrameSlot[] {
  return resolvedSlots.filter((resolvedSlot) => !resolvedSlot.isDeviated);
}

export function findSlotDefinitionById(
  frame: DocumentFrame,
  slotId: string,
): FrameSlotDefinition | undefined {
  return frame.slots.find((slotDefinition) => slotDefinition.slotId === slotId);
}
