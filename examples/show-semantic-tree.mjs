/**
 * Prints the semantic-only SemanticDocumentGraph tree and compile results.
 */

import {
  compileStructural,
  compileRenderable,
  createSemanticDocumentNode,
  defineSemanticDocumentGraph,
  expandFrameInstance,
  getFrameById,
  TECHNICAL_ARTICLE_DIAGNOSTIC_CODES,
  technicalArticleSchema,
} from "../dist/index.js";

const frame = getFrameById("technical_article.explainer");

const semanticOnlyInstance = {
  frameId: "technical_article.explainer",
  title: "How to use docshape",
  semanticFills: {
    introductionProblem: {
      domain: { kind: "text", value: "technical articles written directly as prose" },
      pain: {
        kind: "text",
        value: "missing support, unclear roles, or broken structure",
      },
    },
    introductionGoal: {
      solution: { kind: "text", value: "SemanticDocumentGraph" },
      outcome: { kind: "text", value: "validate obligations before rendering Markdown" },
    },
    workflowBackground: {
      approach: { kind: "text", value: "bottom-up graph construction with semantic links" },
    },
    workflowExample: {
      stepOne: {
        kind: "text",
        value: "defineSemanticDocumentGraph with document, section, paragraph, and sentence nodes",
      },
      stepTwo: {
        kind: "text",
        value: "run compileStructural, fill text, then run compileRenderable",
      },
      stepThree: {
        kind: "text",
        value: "call renderMarkdown to produce the article body",
      },
    },
    summarySummary: {
      takeaway: {
        kind: "text",
        value: "typed graph, two compile passes, tree-order Markdown rendering",
      },
    },
  },
  proseFills: {},
  deviations: [
    {
      paragraphId: "summaryLimitations",
      reason: "This short article does not need a separate limitations section.",
    },
  ],
};

function truncateText(text, maximumLength = 36) {
  if (text.length <= maximumLength) {
    return text;
  }
  return `${text.slice(0, maximumLength)}...`;
}

function formatSemanticPayload(semanticPayload) {
  if (semanticPayload === undefined) {
    return "";
  }

  return Object.entries(semanticPayload)
    .map(([fieldId, semanticValue]) => {
      if (semanticValue.kind === "text") {
        return `${fieldId}: "${truncateText(semanticValue.value)}"`;
      }
      return `${fieldId}: ${semanticValue.kind}`;
    })
    .join(", ");
}

function printTree(node, prefix = "", isLast = true) {
  const connector = prefix === "" ? "" : isLast ? "└─ " : "├─ ";
  const headingText = node.text === "" ? "" : ` "${node.text}"`;
  const label = `${node.layer}: ${node.role}${headingText}`;
  const semanticSummary =
    node.layer === "sentence" ? formatSemanticPayload(node.semanticPayload) : "";
  const linkSummary = (node.links ?? [])
    .map((link) => `${link.type} -> ${link.targetId}`)
    .join("; ");
  const annotationParts = [];

  if (semanticSummary !== "") {
    annotationParts.push(`{${semanticSummary}}`);
  }
  if (linkSummary !== "") {
    annotationParts.push(`[${linkSummary}]`);
  }
  if (node.layer === "sentence" && node.text === "") {
    annotationParts.push("(prose empty)");
  }

  const annotation = annotationParts.length === 0 ? "" : `  ${annotationParts.join(" ")}`;
  console.log(`${prefix}${connector}${label}${annotation}`);

  const childNodes = node.children ?? [];
  const nextPrefix = prefix === "" ? "" : `${prefix}${isLast ? "   " : "│  "}`;

  for (let childIndex = 0; childIndex < childNodes.length; childIndex += 1) {
    const childNode = childNodes[childIndex];
    const childIsLast = childIndex === childNodes.length - 1;
    printTree(childNode, nextPrefix, childIsLast);
  }
}

const expansionResult = expandFrameInstance(frame, semanticOnlyInstance);
const graph = expansionResult.graph;
const structuralResult = compileStructural(graph, technicalArticleSchema);
const renderableResult = compileRenderable(graph, technicalArticleSchema);

console.log("=== Authoring code (semantic-only stage) ===\n");
console.log(`let article = technicalArticleExplainerFrame("How to use docshape")
  .fillSemantic("introductionProblem", {
    domain: { kind: "text", value: "technical articles written directly as prose" },
    pain: { kind: "text", value: "missing support, unclear roles, or broken structure" },
  })
  .fillSemantic("introductionGoal", { ... })
  .fillSemantic("workflowBackground", { ... })
  .fillSemantic("workflowExample", { ... })
  .fillSemantic("summarySummary", { ... })
  .deviate("summaryLimitations", "...");

const structuralResult = article.compileStructural(); // prose still empty`);

console.log("\n=== semantic-only: SemanticDocumentGraph tree ===\n");
printTree(graph.root);

console.log("\n=== compileStructural ===");
console.log(`isValid: ${structuralResult.isValid}`);
console.log(`diagnoses: ${structuralResult.diagnoses.length}`);
console.log(
  "Discourse Flow: " +
    (structuralResult.diagnoses.some((diagnosis) => diagnosis.code.startsWith("TA-FLOW-"))
      ? "FAILED"
      : "passed"),
);

console.log("\n=== compileRenderable (same graph, prose still empty) ===");
console.log(`isValid: ${renderableResult.isValid}`);
console.log(
  `missing prose diagnoses: ${renderableResult.diagnoses.filter((diagnosis) => diagnosis.code.startsWith("FRAME-PROSE")).length}`,
);

const badFlowGraph = defineSemanticDocumentGraph(
  createSemanticDocumentNode({
    id: "document-root",
    layer: "document",
    role: "document",
    text: "",
    links: [],
    children: [
      createSemanticDocumentNode({
        id: "section-compile-modes",
        layer: "section",
        role: "background",
        text: "Compile modes",
        links: [],
        children: [
          createSemanticDocumentNode({
            id: "paragraph-claim",
            layer: "paragraph",
            role: "claim",
            text: "",
            links: [],
            children: [
              createSemanticDocumentNode({
                id: "sentence-claim",
                layer: "sentence",
                role: "claim",
                text: "",
                links: [],
              }),
            ],
          }),
          createSemanticDocumentNode({
            id: "paragraph-reason",
            layer: "paragraph",
            role: "reason",
            text: "",
            links: [],
            children: [
              createSemanticDocumentNode({
                id: "sentence-reason",
                layer: "sentence",
                role: "reason",
                text: "",
                links: [{ type: "supports", targetId: "sentence-claim" }],
              }),
            ],
          }),
        ],
      }),
    ],
  }),
);

const badFlowResult = compileStructural(badFlowGraph, technicalArticleSchema);
const badFlowDiagnosis = badFlowResult.diagnoses.find(
  (diagnosis) =>
    diagnosis.code === TECHNICAL_ARTICLE_DIAGNOSTIC_CODES.flowSupportAfterClaim,
);

console.log("\n=== Discourse Flow: old bad order (claim before reason) ===");
console.log("tree:");
console.log("  claim");
console.log("  reason --supports--> claim");
console.log(`isValid: ${badFlowResult.isValid}`);
console.log(`diagnosis: ${badFlowDiagnosis?.code} on ${badFlowDiagnosis?.nodeId}`);

console.log("\n=== Discourse Flow: current frame order (Compile modes section) ===");
console.log("tree:");
console.log("  reasonStructural --supports--> claim");
console.log("  reasonRenderable --supports--> claim");
console.log("  claim");
console.log("isValid: true (included in structural compile above)");
