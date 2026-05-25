/**
 * Domain types for DocumentFrame authoring and expansion.
 */

import type {
  CompileResult,
  Diagnosis,
  DocumentSchema,
  SemanticDocumentGraph,
} from "./domain.js";

export type FrameSlotRequirement = "required" | "recommended" | "optional";

export interface FrameSectionDefinition {
  sectionId: string;
  title: string;
  role: string;
}

export interface FrameSlotDefinition {
  slotId: string;
  role: string;
  sectionId: string;
  requirement: FrameSlotRequirement;
  defaultText?: string;
  multiSentence?: boolean;
}

export interface FrameLinkTemplate {
  sourceSlotId: string;
  linkType: string;
  targetSlotId?: string;
  targetSectionId?: string;
}

export interface DocumentFrame {
  frameId: string;
  schema: DocumentSchema;
  sections: FrameSectionDefinition[];
  slots: FrameSlotDefinition[];
  linkTemplates: FrameLinkTemplate[];
}

export interface FrameDeviation {
  slotId: string;
  reason: string;
}

export interface FrameInstance {
  frameId: string;
  title: string;
  fills: Record<string, string>;
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

export interface ResolvedFrameSlot {
  slotDefinition: FrameSlotDefinition;
  text: string;
  isDeviated: boolean;
  deviationReason?: string;
}

export interface FrameAuthoringState {
  frameId: string;
  title: string;
  fills: Record<string, string>;
  deviations: FrameDeviation[];
  idOverrides: Record<string, string>;
}
