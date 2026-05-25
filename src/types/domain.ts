/**
 * Shared domain types for SemanticDocumentGraph compilation.
 */

export type DocumentLayer = "document" | "section" | "paragraph" | "sentence";

export type DiagnosisSeverity = "error" | "warning" | "info";

export type SemanticValueKind = "text" | "enum" | "reference";

export interface SemanticValue {
  kind: SemanticValueKind;
  value: string;
}

export interface SemanticLink {
  type: string;
  targetId: string;
}

export interface SemanticDocumentNode {
  id: string;
  layer: DocumentLayer;
  role: string;
  text: string;
  semanticPayload?: Record<string, SemanticValue>;
  children?: SemanticDocumentNode[];
  links: SemanticLink[];
}

export interface SemanticDocumentGraph {
  root: SemanticDocumentNode;
}

export type LinkDirection = "incoming" | "outgoing";

export interface DeclarativeLinkRequirement {
  direction: LinkDirection;
  linkTypes: string[];
  peerRoles?: string[];
  minimumCount?: number;
}

export interface RoleLinkConstraint {
  role: string;
  layers?: DocumentLayer[];
  requirements: DeclarativeLinkRequirement[];
  diagnosticCode: string;
  message: string;
  severity?: DiagnosisSeverity;
  suggestAddLink?: {
    linkType: string;
    direction: LinkDirection;
  };
  suggestInsertParagraph?: {
    role: string;
    reason: string;
  };
}

export interface TextRequiredRule {
  layers: DocumentLayer[];
  roles?: string[];
}

export interface ConstraintEvaluationContext {
  node: IndexedNode;
  graph: SemanticDocumentGraph;
  nodeIndex: Map<string, IndexedNode>;
  incomingLinks: ResolvedLink[];
  outgoingLinks: ResolvedLink[];
}

export interface PredicateConstraint {
  id: string;
  evaluate: (context: ConstraintEvaluationContext) => Diagnosis[];
}

export interface DocumentSchema {
  name: string;
  allowedRoles: string[];
  allowedLinkTypes: string[];
  roleLinkConstraints?: RoleLinkConstraint[];
  textRequiredRules?: TextRequiredRule[];
  predicateConstraints?: PredicateConstraint[];
}

export interface Diagnosis {
  code: string;
  severity: DiagnosisSeverity;
  message: string;
  nodeId?: string;
  suggestedOperations?: PatchOperation[];
}

export interface SplitParagraphOperation {
  type: "split_paragraph";
  source: string;
  into: string[];
}

export interface InsertParagraphOperation {
  type: "insert_paragraph";
  id: string;
  role: string;
  reason: string;
}

export interface AddLinkOperation {
  type: "add_link";
  from: string;
  to: string;
  link: string;
}

export type PatchOperation =
  | SplitParagraphOperation
  | InsertParagraphOperation
  | AddLinkOperation;

export interface PatchPlan {
  operations: PatchOperation[];
}

export interface IndexedNode {
  id: string;
  layer: DocumentLayer;
  role: string;
  text: string;
  parentId: string | null;
  children: SemanticDocumentNode[];
  links: SemanticLink[];
  node: SemanticDocumentNode;
}

export interface ResolvedLink {
  linkType: string;
  sourceId: string;
  targetId: string;
  sourceRole: string;
  targetRole: string;
}

export interface CompileMetadata {
  nodeIndex: Map<string, IndexedNode>;
  parentLookup: Map<string, string | null>;
  incomingLinksByNodeId: Map<string, ResolvedLink[]>;
  outgoingLinksByNodeId: Map<string, ResolvedLink[]>;
}

export interface CompileResult {
  isValid: boolean;
  diagnoses: Diagnosis[];
  metadata: CompileMetadata;
}

export interface CompileOptions {
  mode: "structural" | "renderable";
}
