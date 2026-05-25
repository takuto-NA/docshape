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
import type { FrameAuthoringState, FrameCompileResult, FrameDeviation, FrameInstance } from "../types/frame.js";
import type { SemanticDocumentGraph } from "../types/domain.js";

export function technicalArticleExplainerFrame(title: string): TechnicalArticleExplainerAuthor {
  return new TechnicalArticleExplainerAuthor({
    frameId: technicalArticleExplainerFrameDefinition.frameId,
    title,
    fills: {},
    deviations: [],
    idOverrides: {},
  });
}

export class TechnicalArticleExplainerAuthor {
  private readonly authoringState: FrameAuthoringState;

  constructor(authoringState: FrameAuthoringState) {
    this.authoringState = authoringState;
  }

  fill(slotFills: Record<string, string>): TechnicalArticleExplainerAuthor {
    return new TechnicalArticleExplainerAuthor({
      ...this.authoringState,
      fills: {
        ...this.authoringState.fills,
        ...slotFills,
      },
    });
  }

  deviate(slotId: string, reason: string): TechnicalArticleExplainerAuthor {
    const filteredDeviations = this.authoringState.deviations.filter(
      (deviation) => deviation.slotId !== slotId,
    );

    return new TechnicalArticleExplainerAuthor({
      ...this.authoringState,
      deviations: [...filteredDeviations, { slotId, reason }],
    });
  }

  deviateFromMany(deviations: FrameDeviation[]): TechnicalArticleExplainerAuthor {
    let author: TechnicalArticleExplainerAuthor = this;

    for (const deviation of deviations) {
      author = author.deviate(deviation.slotId, deviation.reason);
    }

    return author;
  }

  toFrameInstance(): FrameInstance {
    return {
      frameId: this.authoringState.frameId,
      title: this.authoringState.title,
      fills: this.authoringState.fills,
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
  slotFills: Record<string, string>,
  deviations: FrameDeviation[] = [],
): FrameInstance {
  return technicalArticleExplainerFrame(title).fill(slotFills).deviateFromMany(deviations).toFrameInstance();
}
