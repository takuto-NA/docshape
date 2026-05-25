/**
 * Domain types for DocumentFrame authoring and expansion.
 */

import type {
  CompileResult,
  Diagnosis,
  DocumentSchema,
  SemanticDocumentGraph,
  SemanticValue,
} from "./domain.js";

export type FramePatternRequirement = "required" | "recommended" | "optional";

export type ProseRequirement = "required" | "optional";

export interface FrameSectionDefinition {
  sectionId: string;
  title: string;
  role: string;
}

export interface SemanticFieldDefinition {
  fieldId: string;
  valueKind: SemanticValue["kind"];
  requirement: FramePatternRequirement;
  defaultValue?: SemanticValue;
}

export interface SentencePattern {
  sentenceId: string;
  role: string;
  requiredSemanticFieldIds: string[];
  proseRequirement: ProseRequirement;
}

export interface ParagraphPatternDefinition {
  paragraphId: string;
  sectionId: string;
  requirement: FramePatternRequirement;
  paragraphRole?: string;
  semanticFields: SemanticFieldDefinition[];
  sentences: SentencePattern[];
}

export interface SentenceLinkTemplate {
  sourceParagraphId: string;
  sourceSentenceId: string;
  linkType: string;
  targetParagraphId?: string;
  targetSentenceId?: string;
  targetSectionId?: string;
}

export interface DocumentFrame {
  frameId: string;
  schema: DocumentSchema;
  sections: FrameSectionDefinition[];
  paragraphPatterns: ParagraphPatternDefinition[];
  linkTemplates: SentenceLinkTemplate[];
}

export interface FrameDeviation {
  paragraphId: string;
  reason: string;
}

export type SemanticFill = Record<string, SemanticValue>;

export type ParagraphProseFill = Record<string, string>;

export type ProseFill = Record<string, ParagraphProseFill>;

export interface FrameInstance {
  frameId: string;
  title: string;
  semanticFills: Record<string, SemanticFill>;
  proseFills: ProseFill;
  deviations?: FrameDeviation[];
  idOverrides?: Record<string, string>;
}

export interface FrameExpansionResult {
  graph: SemanticDocumentGraph;
  expansionDiagnoses: Diagnosis[];
}

export interface FrameCompileResult extends CompileResult {
  expansionDiagnoses: Diagnosis[];
  graph: SemanticDocumentGraph;
}

export interface ResolvedParagraphPattern {
  patternDefinition: ParagraphPatternDefinition;
  semanticFill: SemanticFill;
  proseFill: ParagraphProseFill;
  isDeviated: boolean;
  deviationReason?: string;
}

export interface FrameAuthoringState {
  frameId: string;
  title: string;
  semanticFills: Record<string, SemanticFill>;
  proseFills: ProseFill;
  deviations: FrameDeviation[];
  idOverrides: Record<string, string>;
}

export interface ParagraphPatternResolutionResult {
  resolvedParagraphPatterns: ResolvedParagraphPattern[];
  diagnoses: Diagnosis[];
}
