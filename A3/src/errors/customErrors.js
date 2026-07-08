export class PipelineError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = this.constructor.name;
    this.cause = options.cause;
    this.context = options.context || {};
  }
}

export class PdfExtractionError extends PipelineError {}
export class AiProviderError extends PipelineError {}
export class ValidationError extends PipelineError {}
export class CsvWriteError extends PipelineError {}
