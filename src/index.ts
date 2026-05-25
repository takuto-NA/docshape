/**
 * Public package entry point for the SemanticDocumentGraph compiler core.
 */

export { compileRenderable, compileStructural } from "./compiler/compile-graph.js";
export { CORE_DIAGNOSTIC_CODES } from "./constants/diagnostic-codes.js";
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
