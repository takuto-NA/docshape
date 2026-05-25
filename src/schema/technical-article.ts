/**
 * Built-in technical_article schema for explanatory technical writing.
 */

import { defineDocumentSchema } from "../helpers/define-graph.js";
import type { DocumentSchema } from "../types/domain.js";
import { createDefinitionFlowPredicateConstraint, DEFINITION_FLOW_DIAGNOSTIC_CODES } from "./definition-flow.js";
import { createDiscourseFlowPredicateConstraint, DISCOURSE_FLOW_DIAGNOSTIC_CODES } from "./discourse-flow.js";

export const TECHNICAL_ARTICLE_ROLES = [
  "document",
  "problem",
  "goal",
  "background",
  "claim",
  "reason",
  "evidence",
  "definition",
  "example",
  "assumption",
  "constraint",
  "design_decision",
  "tradeoff",
  "interface",
  "algorithm",
  "data_model",
  "failure_mode",
  "limitation",
  "result",
  "interpretation",
  "summary",
  "open_question",
] as const;

export const TECHNICAL_ARTICLE_LINK_TYPES = [
  "supports",
  "explains",
  "defines",
  "depends_on",
  "contrasts_with",
  "summarizes",
  "motivates",
  "implements",
] as const;

export const TECHNICAL_ARTICLE_DIAGNOSTIC_CODES = {
  unsupportedClaim: "TA-CLAIM-001",
  summaryWithoutTarget: "TA-SUMMARY-001",
  designDecisionWithoutDependency: "TA-DECISION-001",
  ...DISCOURSE_FLOW_DIAGNOSTIC_CODES,
  ...DEFINITION_FLOW_DIAGNOSTIC_CODES,
} as const;

export const technicalArticleSchema: DocumentSchema = defineDocumentSchema({
  name: "technical_article",
  allowedRoles: [...TECHNICAL_ARTICLE_ROLES],
  allowedLinkTypes: [...TECHNICAL_ARTICLE_LINK_TYPES],
  textRequiredRules: [
    {
      layers: ["sentence"],
    },
  ],
  roleLinkConstraints: [
    {
      role: "claim",
      layers: ["sentence"],
      diagnosticCode: TECHNICAL_ARTICLE_DIAGNOSTIC_CODES.unsupportedClaim,
      message: "Claim nodes require incoming supports links from reason or evidence nodes.",
      requirements: [
        {
          direction: "incoming",
          linkTypes: ["supports"],
          peerRoles: ["reason", "evidence"],
        },
      ],
      suggestInsertParagraph: {
        role: "reason",
        reason: "Claim nodes require supporting reason or evidence content.",
      },
    },
    {
      role: "summary",
      layers: ["sentence"],
      diagnosticCode: TECHNICAL_ARTICLE_DIAGNOSTIC_CODES.summaryWithoutTarget,
      message: "Summary nodes require at least one outgoing summarizes link.",
      requirements: [
        {
          direction: "outgoing",
          linkTypes: ["summarizes"],
        },
      ],
      suggestAddLink: {
        linkType: "summarizes",
        direction: "outgoing",
      },
    },
    {
      role: "design_decision",
      layers: ["sentence"],
      diagnosticCode: TECHNICAL_ARTICLE_DIAGNOSTIC_CODES.designDecisionWithoutDependency,
      message:
        "Design decision nodes require outgoing depends_on links to reason or constraint nodes.",
      requirements: [
        {
          direction: "outgoing",
          linkTypes: ["depends_on"],
          peerRoles: ["reason", "constraint"],
        },
      ],
      suggestAddLink: {
        linkType: "depends_on",
        direction: "outgoing",
      },
    },
  ],
  predicateConstraints: [
    createDiscourseFlowPredicateConstraint(),
    createDefinitionFlowPredicateConstraint(),
  ],
});
