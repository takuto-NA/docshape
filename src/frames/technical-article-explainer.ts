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
  paragraphPatterns: [
    {
      paragraphId: "introductionProblem",
      sectionId: "introduction",
      requirement: "required",
      paragraphRole: "problem",
      semanticFields: [
        { fieldId: "domain", valueKind: "text", requirement: "required" },
        { fieldId: "pain", valueKind: "text", requirement: "required" },
      ],
      sentences: [
        {
          sentenceId: "problemStatement",
          role: "problem",
          requiredSemanticFieldIds: ["domain", "pain"],
          proseRequirement: "required",
        },
      ],
    },
    {
      paragraphId: "introductionGraphDefinition",
      sectionId: "introduction",
      requirement: "required",
      paragraphRole: "definition",
      semanticFields: [
        {
          fieldId: "term",
          valueKind: "text",
          requirement: "required",
          defaultValue: { kind: "text", value: "SemanticDocumentGraph" },
        },
        {
          fieldId: "meaning",
          valueKind: "text",
          requirement: "required",
          defaultValue: {
            kind: "text",
            value:
              "A typed graph of sections, paragraphs, sentences, and semantic links used as compiler intermediate representation.",
          },
        },
      ],
      sentences: [
        {
          sentenceId: "definitionStatement",
          role: "definition",
          requiredSemanticFieldIds: ["term", "meaning"],
          proseRequirement: "required",
        },
      ],
    },
    {
      paragraphId: "introductionGoal",
      sectionId: "introduction",
      requirement: "required",
      paragraphRole: "goal",
      semanticFields: [
        {
          fieldId: "solutionConcept",
          valueKind: "reference",
          requirement: "required",
          defaultValue: {
            kind: "reference",
            value: "introductionGraphDefinition::definitionStatement",
          },
        },
        { fieldId: "solution", valueKind: "text", requirement: "required" },
        { fieldId: "outcome", valueKind: "text", requirement: "required" },
      ],
      sentences: [
        {
          sentenceId: "goalStatement",
          role: "goal",
          requiredSemanticFieldIds: ["solutionConcept", "solution", "outcome"],
          proseRequirement: "required",
        },
      ],
    },
    {
      paragraphId: "workflowBackground",
      sectionId: "workflow",
      requirement: "required",
      paragraphRole: "background",
      semanticFields: [
        { fieldId: "approach", valueKind: "text", requirement: "required" },
      ],
      sentences: [
        {
          sentenceId: "workflowStatement",
          role: "background",
          requiredSemanticFieldIds: ["approach"],
          proseRequirement: "required",
        },
      ],
    },
    {
      paragraphId: "workflowConstraint",
      sectionId: "workflow",
      requirement: "required",
      paragraphRole: "constraint",
      semanticFields: [
        {
          fieldId: "constraint",
          valueKind: "text",
          requirement: "required",
          defaultValue: {
            kind: "text",
            value:
              "Structural compile accepts empty sentence text when roles and links are valid.",
          },
        },
      ],
      sentences: [
        {
          sentenceId: "constraintStatement",
          role: "constraint",
          requiredSemanticFieldIds: ["constraint"],
          proseRequirement: "required",
        },
      ],
    },
    {
      paragraphId: "workflowDesignDecision",
      sectionId: "workflow",
      requirement: "required",
      paragraphRole: "design_decision",
      semanticFields: [
        {
          fieldId: "decision",
          valueKind: "text",
          requirement: "required",
          defaultValue: { kind: "text", value: "Build the graph before writing full prose." },
        },
      ],
      sentences: [
        {
          sentenceId: "designDecisionStatement",
          role: "design_decision",
          requiredSemanticFieldIds: ["decision"],
          proseRequirement: "required",
        },
      ],
    },
    {
      paragraphId: "workflowExample",
      sectionId: "workflow",
      requirement: "required",
      paragraphRole: "example",
      semanticFields: [
        { fieldId: "stepOne", valueKind: "text", requirement: "required" },
        { fieldId: "stepTwo", valueKind: "text", requirement: "required" },
        { fieldId: "stepThree", valueKind: "text", requirement: "required" },
      ],
      sentences: [
        {
          sentenceId: "exampleStepOne",
          role: "example",
          requiredSemanticFieldIds: ["stepOne"],
          proseRequirement: "required",
        },
        {
          sentenceId: "exampleStepTwo",
          role: "example",
          requiredSemanticFieldIds: ["stepTwo"],
          proseRequirement: "required",
        },
        {
          sentenceId: "exampleStepThree",
          role: "example",
          requiredSemanticFieldIds: ["stepThree"],
          proseRequirement: "required",
        },
      ],
    },
    {
      paragraphId: "compileModesReasonStructural",
      sectionId: "compileModes",
      requirement: "required",
      paragraphRole: "reason",
      semanticFields: [
        {
          fieldId: "reason",
          valueKind: "text",
          requirement: "required",
          defaultValue: {
            kind: "text",
            value:
              "compileStructural checks ids, nesting, roles, links, and schema constraints while text may still be empty.",
          },
        },
      ],
      sentences: [
        {
          sentenceId: "reasonStructuralStatement",
          role: "reason",
          requiredSemanticFieldIds: ["reason"],
          proseRequirement: "required",
        },
      ],
    },
    {
      paragraphId: "compileModesReasonRenderable",
      sectionId: "compileModes",
      requirement: "required",
      paragraphRole: "reason",
      semanticFields: [
        {
          fieldId: "reason",
          valueKind: "text",
          requirement: "required",
          defaultValue: {
            kind: "text",
            value:
              "compileRenderable adds required-text checks so the graph can be output as Markdown.",
          },
        },
      ],
      sentences: [
        {
          sentenceId: "reasonRenderableStatement",
          role: "reason",
          requiredSemanticFieldIds: ["reason"],
          proseRequirement: "required",
        },
      ],
    },
    {
      paragraphId: "compileModesClaim",
      sectionId: "compileModes",
      requirement: "required",
      paragraphRole: "claim",
      semanticFields: [
        {
          fieldId: "claim",
          valueKind: "text",
          requirement: "required",
          defaultValue: {
            kind: "text",
            value: "Two compile modes separate structure validation from render readiness.",
          },
        },
      ],
      sentences: [
        {
          sentenceId: "claimStatement",
          role: "claim",
          requiredSemanticFieldIds: ["claim"],
          proseRequirement: "required",
        },
      ],
    },
    {
      paragraphId: "summarySummary",
      sectionId: "summary",
      requirement: "required",
      paragraphRole: "summary",
      semanticFields: [
        { fieldId: "takeaway", valueKind: "text", requirement: "required" },
      ],
      sentences: [
        {
          sentenceId: "summaryStatement",
          role: "summary",
          requiredSemanticFieldIds: ["takeaway"],
          proseRequirement: "required",
        },
      ],
    },
    {
      paragraphId: "summaryLimitations",
      sectionId: "summary",
      requirement: "recommended",
      paragraphRole: "limitation",
      semanticFields: [
        { fieldId: "limitation", valueKind: "text", requirement: "optional" },
      ],
      sentences: [
        {
          sentenceId: "limitationStatement",
          role: "limitation",
          requiredSemanticFieldIds: ["limitation"],
          proseRequirement: "optional",
        },
      ],
    },
  ],
  linkTemplates: [
    {
      sourceParagraphId: "workflowDesignDecision",
      sourceSentenceId: "designDecisionStatement",
      linkType: "depends_on",
      targetParagraphId: "workflowConstraint",
      targetSentenceId: "constraintStatement",
    },
    {
      sourceParagraphId: "compileModesReasonStructural",
      sourceSentenceId: "reasonStructuralStatement",
      linkType: "supports",
      targetParagraphId: "compileModesClaim",
      targetSentenceId: "claimStatement",
    },
    {
      sourceParagraphId: "compileModesReasonRenderable",
      sourceSentenceId: "reasonRenderableStatement",
      linkType: "supports",
      targetParagraphId: "compileModesClaim",
      targetSentenceId: "claimStatement",
    },
    {
      sourceParagraphId: "summarySummary",
      sourceSentenceId: "summaryStatement",
      linkType: "summarizes",
      targetSectionId: "workflow",
    },
    {
      sourceParagraphId: "summarySummary",
      sourceSentenceId: "summaryStatement",
      linkType: "summarizes",
      targetSectionId: "compileModes",
    },
  ],
};
