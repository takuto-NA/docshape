/**
 * Fluent authoring API for the technical_article.explainer frame.
 */

import {
  compileFrameInstanceRenderable,
  compileFrameInstanceStructural,
  renderFrameInstanceMarkdown,
} from "../frame/frame-helpers.js";
import { expandFrameInstance } from "../frame/expand-frame.js";
import { technicalArticleExplainerFrameDefinition } from "./technical-article-explainer.js";
import type {
  FrameAuthoringState,
  FrameCompileResult,
  FrameDeviation,
  FrameInstance,
  ParagraphProseFill,
  SemanticFill,
} from "../types/frame.js";
import type { SemanticDocumentGraph } from "../types/domain.js";

export function technicalArticleExplainerFrame(title: string): TechnicalArticleExplainerAuthor {
  return new TechnicalArticleExplainerAuthor({
    frameId: technicalArticleExplainerFrameDefinition.frameId,
    title,
    semanticFills: {},
    proseFills: {},
    deviations: [],
    idOverrides: {},
  });
}

export class TechnicalArticleExplainerAuthor {
  private readonly authoringState: FrameAuthoringState;

  constructor(authoringState: FrameAuthoringState) {
    this.authoringState = authoringState;
  }

  fillSemantic(
    paragraphId: string,
    semanticFill: SemanticFill,
  ): TechnicalArticleExplainerAuthor {
    return new TechnicalArticleExplainerAuthor({
      ...this.authoringState,
      semanticFills: {
        ...this.authoringState.semanticFills,
        [paragraphId]: {
          ...(this.authoringState.semanticFills[paragraphId] ?? {}),
          ...semanticFill,
        },
      },
    });
  }

  fillProse(
    paragraphId: string,
    proseFill: ParagraphProseFill,
  ): TechnicalArticleExplainerAuthor {
    return new TechnicalArticleExplainerAuthor({
      ...this.authoringState,
      proseFills: {
        ...this.authoringState.proseFills,
        [paragraphId]: {
          ...(this.authoringState.proseFills[paragraphId] ?? {}),
          ...proseFill,
        },
      },
    });
  }

  deviate(paragraphId: string, reason: string): TechnicalArticleExplainerAuthor {
    const filteredDeviations = this.authoringState.deviations.filter(
      (deviation) => deviation.paragraphId !== paragraphId,
    );

    return new TechnicalArticleExplainerAuthor({
      ...this.authoringState,
      deviations: [...filteredDeviations, { paragraphId, reason }],
    });
  }

  deviateFromMany(deviations: FrameDeviation[]): TechnicalArticleExplainerAuthor {
    let author: TechnicalArticleExplainerAuthor = this;

    for (const deviation of deviations) {
      author = author.deviate(deviation.paragraphId, deviation.reason);
    }

    return author;
  }

  toFrameInstance(): FrameInstance {
    return {
      frameId: this.authoringState.frameId,
      title: this.authoringState.title,
      semanticFills: this.authoringState.semanticFills,
      proseFills: this.authoringState.proseFills,
      deviations: this.authoringState.deviations,
      idOverrides: this.authoringState.idOverrides,
    };
  }

  toGraph(): SemanticDocumentGraph {
    return expandFrameInstance(
      technicalArticleExplainerFrameDefinition,
      this.toFrameInstance(),
    ).graph;
  }

  compileStructural(): FrameCompileResult {
    return compileFrameInstanceStructural(
      technicalArticleExplainerFrameDefinition,
      this.toFrameInstance(),
    );
  }

  compileRenderable(): FrameCompileResult {
    return compileFrameInstanceRenderable(
      technicalArticleExplainerFrameDefinition,
      this.toFrameInstance(),
    );
  }

  compile(): FrameCompileResult {
    return this.compileRenderable();
  }

  renderMarkdown(): string {
    return renderFrameInstanceMarkdown(
      technicalArticleExplainerFrameDefinition,
      this.toFrameInstance(),
    );
  }
}

export function createTechnicalArticleExplainerInstance(
  title: string,
  semanticFills: FrameInstance["semanticFills"],
  proseFills: FrameInstance["proseFills"] = {},
  deviations: FrameDeviation[] = [],
): FrameInstance {
  let author = technicalArticleExplainerFrame(title);

  for (const [paragraphId, semanticFill] of Object.entries(semanticFills)) {
    author = author.fillSemantic(paragraphId, semanticFill);
  }

  for (const [paragraphId, proseFill] of Object.entries(proseFills)) {
    author = author.fillProse(paragraphId, proseFill);
  }

  return author.deviateFromMany(deviations).toFrameInstance();
}
