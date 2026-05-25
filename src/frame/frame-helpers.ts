/**
 * Compile and render helpers for DocumentFrame instances.
 */

import { compileRenderable, compileStructural } from "../compiler/compile-graph.js";
import { technicalArticleExplainerFrameDefinition } from "../frames/technical-article-explainer.js";
import { renderMarkdown } from "../renderer/markdown-renderer.js";
import type { CompileOptions, CompileResult } from "../types/domain.js";
import type {
  DocumentFrame,
  FrameCompileResult,
  FrameExpansionResult,
  FrameInstance,
} from "../types/frame.js";
import { expandFrameInstance } from "./expand-frame.js";

const frameRegistry: Record<string, DocumentFrame> = {
  [technicalArticleExplainerFrameDefinition.frameId]: technicalArticleExplainerFrameDefinition,
};

export function getFrameById(frameId: string): DocumentFrame | undefined {
  return frameRegistry[frameId];
}

export function expandFrame(
  frame: DocumentFrame,
  instance: FrameInstance,
): FrameExpansionResult {
  return expandFrameInstance(frame, instance);
}

export function compileFrameInstance(
  frame: DocumentFrame,
  instance: FrameInstance,
  options: CompileOptions = { mode: "structural" },
): FrameCompileResult {
  const expansionResult = expandFrameInstance(frame, instance);
  const compileResult =
    options.mode === "renderable"
      ? compileRenderable(expansionResult.graph, frame.schema)
      : compileStructural(expansionResult.graph, frame.schema);

  return mergeFrameCompileResult(expansionResult, compileResult);
}

export function compileFrameInstanceStructural(
  frame: DocumentFrame,
  instance: FrameInstance,
): FrameCompileResult {
  return compileFrameInstance(frame, instance, { mode: "structural" });
}

export function compileFrameInstanceRenderable(
  frame: DocumentFrame,
  instance: FrameInstance,
): FrameCompileResult {
  return compileFrameInstance(frame, instance, { mode: "renderable" });
}

export function renderFrameInstanceMarkdown(
  frame: DocumentFrame,
  instance: FrameInstance,
): string {
  const expansionResult = expandFrameInstance(frame, instance);
  return renderMarkdown(expansionResult.graph);
}

function mergeFrameCompileResult(
  expansionResult: FrameExpansionResult,
  compileResult: CompileResult,
): FrameCompileResult {
  const expansionErrors = expansionResult.expansionDiagnoses.filter(
    (diagnosis) => diagnosis.severity === "error",
  );
  const mergedDiagnoses = [...expansionResult.expansionDiagnoses, ...compileResult.diagnoses];

  return {
    graph: expansionResult.graph,
    expansionDiagnoses: expansionResult.expansionDiagnoses,
    metadata: compileResult.metadata,
    diagnoses: mergedDiagnoses,
    isValid: expansionErrors.length === 0 && compileResult.isValid,
  };
}
