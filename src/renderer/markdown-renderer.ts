/**
 * Renders SemanticDocumentGraph content to Markdown using tree order only.
 */

import type { SemanticDocumentGraph, SemanticDocumentNode } from "../types/domain.js";

const ROOT_SECTION_HEADING_LEVEL = 1;
const MAXIMUM_HEADING_LEVEL = 6;

export function renderMarkdown(graph: SemanticDocumentGraph): string {
  const renderedLines: string[] = [];
  renderNode(graph.root, ROOT_SECTION_HEADING_LEVEL, renderedLines);
  return renderedLines.join("\n").trim();
}

function renderNode(
  node: SemanticDocumentNode,
  sectionHeadingLevel: number,
  renderedLines: string[],
): void {
  if (node.layer === "document") {
    renderChildren(node, sectionHeadingLevel, renderedLines);
    return;
  }

  if (node.layer === "section") {
    renderedLines.push(`${"#".repeat(sectionHeadingLevel)} ${node.text}`.trim());
    renderChildren(node, Math.min(sectionHeadingLevel + 1, MAXIMUM_HEADING_LEVEL), renderedLines);
    return;
  }

  if (node.layer === "paragraph") {
    const paragraphText = collectParagraphText(node);
    if (paragraphText.length > 0) {
      renderedLines.push(paragraphText);
      renderedLines.push("");
    }
    return;
  }

  if (node.layer === "sentence") {
    if (node.text.trim().length > 0) {
      renderedLines.push(node.text.trim());
    }
  }
}

function renderChildren(
  node: SemanticDocumentNode,
  sectionHeadingLevel: number,
  renderedLines: string[],
): void {
  for (const childNode of node.children ?? []) {
    renderNode(childNode, sectionHeadingLevel, renderedLines);
  }
}

function collectParagraphText(paragraphNode: SemanticDocumentNode): string {
  const sentenceTexts: string[] = [];

  for (const childNode of paragraphNode.children ?? []) {
    if (childNode.layer !== "sentence") {
      continue;
    }

    if (childNode.text.trim().length === 0) {
      continue;
    }

    sentenceTexts.push(childNode.text.trim());
  }

  return sentenceTexts.join(" ");
}
