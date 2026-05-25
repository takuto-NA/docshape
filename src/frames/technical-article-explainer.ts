/**
 * Built-in technical_article.explainer DocumentFrame.
 */

import { technicalArticleSchema } from "../schema/technical-article.js";
import type { DocumentFrame } from "../types/frame.js";

export const TECHNICAL_ARTICLE_EXPLAINER_FRAME_ID = "technical_article.explainer";

export const technicalArticleExplainerFrameDefinition: DocumentFrame = {
  frameId: TECHNICAL_ARTICLE_EXPLAINER_FRAME_ID,
  schema: technicalArticleSchema,
  sections: [
    {
      sectionId: "introduction",
      title: "Introduction",
      role: "background",
    },
    {
      sectionId: "workflow",
      title: "Workflow",
      role: "background",
    },
    {
      sectionId: "compileModes",
      title: "Compile modes",
      role: "background",
    },
    {
      sectionId: "summary",
      title: "Summary",
      role: "summary",
    },
  ],
  slots: [
    {
      slotId: "problem",
      role: "problem",
      sectionId: "introduction",
      requirement: "required",
    },
    {
      slotId: "goal",
      role: "goal",
      sectionId: "introduction",
      requirement: "required",
    },
    {
      slotId: "workflow",
      role: "background",
      sectionId: "workflow",
      requirement: "required",
    },
    {
      slotId: "designDecision",
      role: "design_decision",
      sectionId: "workflow",
      requirement: "required",
      defaultText: "Build the graph before writing full prose.",
    },
    {
      slotId: "workflowConstraint",
      role: "constraint",
      sectionId: "workflow",
      requirement: "required",
      defaultText:
        "Structural compile accepts empty sentence text when roles and links are valid.",
    },
    {
      slotId: "example",
      role: "example",
      sectionId: "workflow",
      requirement: "required",
      multiSentence: true,
    },
    {
      slotId: "claim",
      role: "claim",
      sectionId: "compileModes",
      requirement: "required",
      defaultText: "Two compile modes separate structure validation from render readiness.",
    },
    {
      slotId: "reasonStructural",
      role: "reason",
      sectionId: "compileModes",
      requirement: "required",
      defaultText:
        "compileStructural checks ids, nesting, roles, links, and schema constraints while text may still be empty.",
    },
    {
      slotId: "reasonRenderable",
      role: "reason",
      sectionId: "compileModes",
      requirement: "required",
      defaultText:
        "compileRenderable adds required-text checks so the graph can be output as Markdown.",
    },
    {
      slotId: "summary",
      role: "summary",
      sectionId: "summary",
      requirement: "required",
    },
    {
      slotId: "limitations",
      role: "limitation",
      sectionId: "summary",
      requirement: "recommended",
    },
  ],
  linkTemplates: [
    {
      sourceSlotId: "designDecision",
      linkType: "depends_on",
      targetSlotId: "workflowConstraint",
    },
    {
      sourceSlotId: "reasonStructural",
      linkType: "supports",
      targetSlotId: "claim",
    },
    {
      sourceSlotId: "reasonRenderable",
      linkType: "supports",
      targetSlotId: "claim",
    },
    {
      sourceSlotId: "summary",
      linkType: "summarizes",
      targetSectionId: "workflow",
    },
    {
      sourceSlotId: "summary",
      linkType: "summarizes",
      targetSectionId: "compileModes",
    },
  ],
};
