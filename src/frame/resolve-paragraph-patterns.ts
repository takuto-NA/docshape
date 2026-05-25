/**
 * Resolves paragraph patterns, semantic fills, deviations, and prose readiness.
 */

import { FRAME_DIAGNOSTIC_CODES } from "../constants/frame-diagnostic-codes.js";
import type { Diagnosis, SemanticValue } from "../types/domain.js";
import type {
  DocumentFrame,
  FrameInstance,
  ParagraphPatternDefinition,
  ParagraphPatternResolutionResult,
  ParagraphProseFill,
  ResolvedParagraphPattern,
  SemanticFill,
} from "../types/frame.js";

export function resolveParagraphPatterns(
  frame: DocumentFrame,
  instance: FrameInstance,
): ParagraphPatternResolutionResult {
  const diagnoses: Diagnosis[] = [];
  const deviationByParagraphId = buildDeviationLookup(instance);
  const resolvedParagraphPatterns: ResolvedParagraphPattern[] = [];

  validateUnknownSemanticFillParagraphs(frame, instance, diagnoses);
  validateUnknownProseFillParagraphs(frame, instance, diagnoses);
  validateUnknownDeviations(frame, instance, diagnoses);
  validateFrameIdMatch(frame, instance, diagnoses);
  validateDeviationReasons(instance, diagnoses);

  for (const patternDefinition of frame.paragraphPatterns) {
    const deviation = deviationByParagraphId.get(patternDefinition.paragraphId);
    const semanticFill = resolveSemanticFill(patternDefinition, instance, diagnoses);
    const proseFill = instance.proseFills[patternDefinition.paragraphId] ?? {};

    if (deviation !== undefined) {
      diagnoses.push({
        code: FRAME_DIAGNOSTIC_CODES.paragraphDeviated,
        severity: "info",
        message: `Paragraph pattern "${patternDefinition.paragraphId}" was omitted from the frame: ${deviation.reason}`,
        nodeId: patternDefinition.paragraphId,
      });
      resolvedParagraphPatterns.push({
        patternDefinition,
        semanticFill: {},
        proseFill: {},
        isDeviated: true,
        deviationReason: deviation.reason,
      });
      continue;
    }

    if (patternDefinition.requirement === "optional" && !hasAnySemanticFill(semanticFill)) {
      continue;
    }

    if (!hasRequiredSemanticFields(patternDefinition, semanticFill)) {
      continue;
    }

    resolvedParagraphPatterns.push({
      patternDefinition,
      semanticFill,
      proseFill,
      isDeviated: false,
    });
  }

  return { resolvedParagraphPatterns, diagnoses };
}

export function validateProseFills(
  frame: DocumentFrame,
  instance: FrameInstance,
  resolvedParagraphPatterns: ResolvedParagraphPattern[],
): Diagnosis[] {
  const diagnoses: Diagnosis[] = [];
  const includedParagraphPatterns = getIncludedParagraphPatterns(resolvedParagraphPatterns);

  validateUnknownProseSentenceIds(frame, instance, diagnoses);

  for (const resolvedParagraphPattern of includedParagraphPatterns) {
    for (const sentencePattern of resolvedParagraphPattern.patternDefinition.sentences) {
      if (sentencePattern.proseRequirement !== "required") {
        continue;
      }

      const proseText =
        resolvedParagraphPattern.proseFill[sentencePattern.sentenceId]?.trim() ?? "";

      if (proseText.length > 0) {
        continue;
      }

      diagnoses.push({
        code: FRAME_DIAGNOSTIC_CODES.missingRequiredSentenceProse,
        severity: "error",
        message: `Required prose for sentence "${sentencePattern.sentenceId}" in paragraph "${resolvedParagraphPattern.patternDefinition.paragraphId}" is missing.`,
        nodeId: `${resolvedParagraphPattern.patternDefinition.paragraphId}.${sentencePattern.sentenceId}`,
      });
    }
  }

  return diagnoses;
}

export function getIncludedParagraphPatterns(
  resolvedParagraphPatterns: ResolvedParagraphPattern[],
): ResolvedParagraphPattern[] {
  return resolvedParagraphPatterns.filter(
    (resolvedParagraphPattern) => !resolvedParagraphPattern.isDeviated,
  );
}

function resolveSemanticFill(
  patternDefinition: ParagraphPatternDefinition,
  instance: FrameInstance,
  diagnoses: Diagnosis[],
): SemanticFill {
  const providedSemanticFill = instance.semanticFills[patternDefinition.paragraphId] ?? {};
  const resolvedSemanticFill: SemanticFill = {};

  validateUnknownSemanticFields(patternDefinition, providedSemanticFill, diagnoses);

  for (const semanticFieldDefinition of patternDefinition.semanticFields) {
    const providedValue = providedSemanticFill[semanticFieldDefinition.fieldId];
    const resolvedValue = providedValue ?? semanticFieldDefinition.defaultValue;

    if (resolvedValue === undefined) {
      if (semanticFieldDefinition.requirement === "required") {
        diagnoses.push({
          code: FRAME_DIAGNOSTIC_CODES.missingRequiredSemanticField,
          severity: "error",
          message: `Required semantic field "${semanticFieldDefinition.fieldId}" is missing in paragraph "${patternDefinition.paragraphId}".`,
          nodeId: `${patternDefinition.paragraphId}.${semanticFieldDefinition.fieldId}`,
        });
      }
      continue;
    }

    if (resolvedValue.kind !== semanticFieldDefinition.valueKind) {
      diagnoses.push({
        code: FRAME_DIAGNOSTIC_CODES.semanticValueKindMismatch,
        severity: "error",
        message: `Semantic field "${semanticFieldDefinition.fieldId}" in paragraph "${patternDefinition.paragraphId}" expects kind "${semanticFieldDefinition.valueKind}" but received "${resolvedValue.kind}".`,
        nodeId: `${patternDefinition.paragraphId}.${semanticFieldDefinition.fieldId}`,
      });
      continue;
    }

    resolvedSemanticFill[semanticFieldDefinition.fieldId] = resolvedValue;
  }

  return resolvedSemanticFill;
}

function hasRequiredSemanticFields(
  patternDefinition: ParagraphPatternDefinition,
  semanticFill: SemanticFill,
): boolean {
  for (const semanticFieldDefinition of patternDefinition.semanticFields) {
    if (semanticFieldDefinition.requirement !== "required") {
      continue;
    }

    if (semanticFill[semanticFieldDefinition.fieldId] === undefined) {
      return false;
    }
  }

  return true;
}

function hasAnySemanticFill(semanticFill: SemanticFill): boolean {
  return Object.keys(semanticFill).length > 0;
}

function buildDeviationLookup(instance: FrameInstance): Map<string, { reason: string }> {
  const deviationLookup = new Map<string, { reason: string }>();

  for (const deviation of instance.deviations ?? []) {
    deviationLookup.set(deviation.paragraphId, { reason: deviation.reason });
  }

  return deviationLookup;
}

function validateUnknownSemanticFillParagraphs(
  frame: DocumentFrame,
  instance: FrameInstance,
  diagnoses: Diagnosis[],
): void {
  const knownParagraphIds = new Set(
    frame.paragraphPatterns.map(
      (patternDefinition) => patternDefinition.paragraphId,
    ),
  );

  for (const paragraphId of Object.keys(instance.semanticFills)) {
    if (knownParagraphIds.has(paragraphId)) {
      continue;
    }

    diagnoses.push({
      code: FRAME_DIAGNOSTIC_CODES.unknownSemanticFillParagraph,
      severity: "warning",
      message: `Semantic fill paragraph "${paragraphId}" does not match any paragraph pattern in frame "${frame.frameId}".`,
      nodeId: paragraphId,
    });
  }
}

function validateUnknownProseFillParagraphs(
  frame: DocumentFrame,
  instance: FrameInstance,
  diagnoses: Diagnosis[],
): void {
  const knownParagraphIds = new Set(
    frame.paragraphPatterns.map(
      (patternDefinition) => patternDefinition.paragraphId,
    ),
  );

  for (const paragraphId of Object.keys(instance.proseFills)) {
    if (knownParagraphIds.has(paragraphId)) {
      continue;
    }

    diagnoses.push({
      code: FRAME_DIAGNOSTIC_CODES.unknownSemanticFillParagraph,
      severity: "warning",
      message: `Prose fill paragraph "${paragraphId}" does not match any paragraph pattern in frame "${frame.frameId}".`,
      nodeId: paragraphId,
    });
  }
}

function validateUnknownSemanticFields(
  patternDefinition: ParagraphPatternDefinition,
  providedSemanticFill: SemanticFill,
  diagnoses: Diagnosis[],
): void {
  const knownFieldIds = new Set(
    patternDefinition.semanticFields.map(
      (semanticFieldDefinition) => semanticFieldDefinition.fieldId,
    ),
  );

  for (const fieldId of Object.keys(providedSemanticFill)) {
    if (knownFieldIds.has(fieldId)) {
      continue;
    }

    diagnoses.push({
      code: FRAME_DIAGNOSTIC_CODES.unknownSemanticField,
      severity: "warning",
      message: `Semantic field "${fieldId}" does not match any field in paragraph "${patternDefinition.paragraphId}".`,
      nodeId: `${patternDefinition.paragraphId}.${fieldId}`,
    });
  }
}

function validateUnknownProseSentenceIds(
  frame: DocumentFrame,
  instance: FrameInstance,
  diagnoses: Diagnosis[],
): void {
  for (const patternDefinition of frame.paragraphPatterns) {
    const proseFill = instance.proseFills[patternDefinition.paragraphId];

    if (proseFill === undefined) {
      continue;
    }

    const knownSentenceIds = new Set(
      patternDefinition.sentences.map((sentencePattern) => sentencePattern.sentenceId),
    );

    for (const sentenceId of Object.keys(proseFill)) {
      if (knownSentenceIds.has(sentenceId)) {
        continue;
      }

      diagnoses.push({
        code: FRAME_DIAGNOSTIC_CODES.unknownProseSentenceId,
        severity: "warning",
        message: `Prose sentence "${sentenceId}" does not match any sentence pattern in paragraph "${patternDefinition.paragraphId}".`,
        nodeId: `${patternDefinition.paragraphId}.${sentenceId}`,
      });
    }
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
      message: `Deviation for paragraph "${deviation.paragraphId}" requires a non-empty reason.`,
      nodeId: deviation.paragraphId,
    });
  }
}

function validateUnknownDeviations(
  frame: DocumentFrame,
  instance: FrameInstance,
  diagnoses: Diagnosis[],
): void {
  const knownParagraphIds = new Set(
    frame.paragraphPatterns.map(
      (patternDefinition) => patternDefinition.paragraphId,
    ),
  );

  for (const deviation of instance.deviations ?? []) {
    if (knownParagraphIds.has(deviation.paragraphId)) {
      continue;
    }

    diagnoses.push({
      code: FRAME_DIAGNOSTIC_CODES.unknownDeviation,
      severity: "warning",
      message: `Deviation paragraph "${deviation.paragraphId}" does not match any paragraph pattern in frame "${frame.frameId}".`,
      nodeId: deviation.paragraphId,
    });
  }
}

export function findParagraphPatternById(
  frame: DocumentFrame,
  paragraphId: string,
): ParagraphPatternDefinition | undefined {
  return frame.paragraphPatterns.find(
    (patternDefinition) => patternDefinition.paragraphId === paragraphId,
  );
}
