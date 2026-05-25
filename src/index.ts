/**
 * Public package entry point for the SemanticDocumentGraph compiler core.
 */

export { compileRenderable, compileStructural } from "./compiler/compile-graph.js";
export { CORE_DIAGNOSTIC_CODES } from "./constants/diagnostic-codes.js";
export { FRAME_DIAGNOSTIC_CODES } from "./constants/frame-diagnostic-codes.js";
export { expandFrameInstance } from "./frame/expand-frame.js";
export {
  compileFrameInstance,
  compileFrameInstanceRenderable,
  compileFrameInstanceStructural,
  expandFrame,
  getFrameById,
  renderFrameInstanceMarkdown,
} from "./frame/frame-helpers.js";
export { resolveFrameSlots } from "./frame/resolve-slots.js";
export {
  buildLogicalSectionId,
  buildLogicalSlotSentenceId,
  createFrameInstanceKey,
  generateDocumentNodeId,
  generateFrameNodeId,
  generateSectionNodeId,
  generateSlotNodeId,
} from "./frame/id-generator.js";
export {
  TechnicalArticleExplainerAuthor,
  createTechnicalArticleExplainerInstance,
  technicalArticleExplainerFrame,
} from "./frames/technical-article-explainer-fluent.js";
export {
  TECHNICAL_ARTICLE_EXPLAINER_FRAME_ID,
  technicalArticleExplainerFrameDefinition,
} from "./frames/technical-article-explainer.js";
export {
  createSemanticDocumentNode,
  defineDocumentSchema,
  defineSemanticDocumentGraph,
} from "./helpers/define-graph.js";
export { renderMarkdown } from "./renderer/markdown-renderer.js";
export {
  TECHNICAL_ARTICLE_DIAGNOSTIC_CODES,
  TECHNICAL_ARTICLE_LINK_TYPES,
  TECHNICAL_ARTICLE_ROLES,
  technicalArticleSchema,
} from "./schema/technical-article.js";
export type {
  AddLinkOperation,
  CompileMetadata,
  CompileOptions,
  CompileResult,
  ConstraintEvaluationContext,
  DeclarativeLinkRequirement,
  Diagnosis,
  DiagnosisSeverity,
  DocumentLayer,
  DocumentSchema,
  IndexedNode,
  InsertParagraphOperation,
  LinkDirection,
  PatchOperation,
  PatchPlan,
  PredicateConstraint,
  ResolvedLink,
  RoleLinkConstraint,
  SemanticDocumentGraph,
  SemanticDocumentNode,
  SemanticLink,
  SplitParagraphOperation,
  TextRequiredRule,
} from "./types/domain.js";
export type {
  DocumentFrame,
  FrameAuthoringState,
  FrameCompileResult,
  FrameDeviation,
  FrameExpansionResult,
  FrameInstance,
  FrameLinkTemplate,
  FrameSectionDefinition,
  FrameSlotDefinition,
  FrameSlotRequirement,
  ResolvedFrameSlot,
} from "./types/frame.js";
